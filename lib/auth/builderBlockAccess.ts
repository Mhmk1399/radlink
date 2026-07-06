import { Types } from "mongoose";
import { NextResponse } from "next/server";
import type { AuthRequest } from "@/lib/auth/types";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import Block from "@/models/blocks";

export const BUILDER_BLOCK_ACTIONS = [
  "view",
  "create",
  "update",
  "publish",
] as const;

export type BuilderBlockAction = (typeof BUILDER_BLOCK_ACTIONS)[number];

type BlockLike = {
  instanceId?: unknown;
  blockId?: unknown;
  _id?: unknown;
  id?: unknown;
  type?: unknown;
};

type BlockDescriptor = {
  id: string | null;
  type: string | null;
  name: string;
  instanceId: string | null;
  raw: unknown;
};

type BuilderBlockPolicy = {
  unrestricted: boolean;
  globalActions: Set<string>;
  blockActions: Record<string, Set<string>>;
};

type MutationAccessInput = {
  currentBlocks: unknown;
  nextBlocks: unknown;
  requirePublish?: boolean;
};

const ACTION_LABELS: Record<BuilderBlockAction, string> = {
  view: "مشاهده",
  create: "ساخت",
  update: "ویرایش",
  publish: "انتشار",
};

function objectIdString(value: unknown) {
  if (value instanceof Types.ObjectId) return String(value);
  if (typeof value === "string") {
    return Types.ObjectId.isValid(value) ? value : null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const id = String(record._id ?? record.id ?? "");
    return Types.ObjectId.isValid(id) ? id : null;
  }

  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function blockRef(value: unknown) {
  const directId = objectIdString(value);
  const block =
    value && typeof value === "object" ? (value as BlockLike) : {};

  return {
    id: directId ?? objectIdString(block.blockId ?? block._id ?? block.id),
    type: stringValue(block.type),
    instanceId: stringValue(block.instanceId),
  };
}

function normalizedBlocks(value: unknown) {
  return Array.isArray(value) ? value : [];
}

async function resolvePolicy(req: AuthRequest): Promise<BuilderBlockPolicy> {
  const user = req.ctx?.user;
  if (!user) {
    return {
      unrestricted: false,
      globalActions: new Set(),
      blockActions: {},
    };
  }

  if (user.role === "superAdmin") {
    return {
      unrestricted: true,
      globalActions: new Set(BUILDER_BLOCK_ACTIONS),
      blockActions: {},
    };
  }

  const resolved = await resolveUserAccess(String(user._id), user.permissions);
  return {
    unrestricted: false,
    globalActions:
      resolved.components["admin.blocks"] ?? new Set<string>(),
    blockActions: resolved.blocks,
  };
}

function hasAction(
  policy: BuilderBlockPolicy,
  blockId: string | null,
  action: BuilderBlockAction,
) {
  if (policy.unrestricted || policy.globalActions.has(action)) return true;
  return blockId
    ? (policy.blockActions[blockId]?.has(action) ?? false)
    : false;
}

function effectiveActions(policy: BuilderBlockPolicy, blockId: string) {
  return BUILDER_BLOCK_ACTIONS.filter((action) =>
    hasAction(policy, blockId, action),
  );
}

async function describeBlocks(values: unknown[]) {
  const refs = values.map(blockRef);
  const ids = [...new Set(refs.map((ref) => ref.id).filter(Boolean))] as string[];
  const types = [
    ...new Set(refs.map((ref) => ref.type).filter(Boolean)),
  ] as string[];

  const records =
    ids.length > 0 || types.length > 0
      ? await Block.find({
          $or: [
            ...(ids.length > 0 ? [{ _id: { $in: ids } }] : []),
            ...(types.length > 0 ? [{ type: { $in: types } }] : []),
          ],
        })
          .select("_id type name isActive")
          .lean()
      : [];

  const byId = new Map(records.map((block) => [String(block._id), block]));
  const byType = new Map(
    records.map((block) => [String(block.type), block]),
  );

  return values.map((raw, index): BlockDescriptor => {
    const ref = refs[index];
    const record =
      (ref.id ? byId.get(ref.id) : undefined) ??
      (ref.type ? byType.get(ref.type) : undefined);

    return {
      id: record ? String(record._id) : ref.id,
      type: record ? String(record.type) : ref.type,
      name:
        String(record?.name ?? ref.type ?? ref.id ?? `بلاک ${index + 1}`),
      instanceId: ref.instanceId,
      raw,
    };
  });
}

function accessDeniedResponse(
  descriptor: BlockDescriptor,
  action: BuilderBlockAction,
  operation: string,
) {
  const actionLabel = ACTION_LABELS[action];

  return NextResponse.json(
    {
      code: "BUILDER_BLOCK_ACCESS_DENIED",
      message: `برای ${operation} بلاک «${descriptor.name}» به دسترسی «${actionLabel}» نیاز دارید.`,
      requiredAccess: {
        resource: "blocks",
        resourceId: descriptor.id,
        action,
      },
      block: {
        id: descriptor.id,
        type: descriptor.type,
        name: descriptor.name,
        instanceId: descriptor.instanceId,
      },
      operation,
    },
    { status: 403 },
  );
}

function invalidBlockResponse(descriptor: BlockDescriptor) {
  return NextResponse.json(
    {
      code: "BUILDER_BLOCK_REFERENCE_INVALID",
      message: `اطلاعات مرجع بلاک «${descriptor.name}» معتبر نیست یا این بلاک دیگر در دسترس نیست.`,
      block: {
        id: descriptor.id,
        type: descriptor.type,
        name: descriptor.name,
        instanceId: descriptor.instanceId,
      },
    },
    { status: 400 },
  );
}

async function assertDescriptorsAction(
  policy: BuilderBlockPolicy,
  descriptors: BlockDescriptor[],
  action: BuilderBlockAction,
  operation: string,
) {
  for (const descriptor of descriptors) {
    if (!descriptor.id) return invalidBlockResponse(descriptor);
    if (!hasAction(policy, descriptor.id, action)) {
      return accessDeniedResponse(descriptor, action, operation);
    }
  }

  return null;
}

function descriptorKey(descriptor: BlockDescriptor, index: number) {
  return descriptor.instanceId
    ? `instance:${descriptor.instanceId}`
    : `resource:${descriptor.id ?? descriptor.type ?? "unknown"}:${index}`;
}

function comparableValue(value: unknown): unknown {
  if (value instanceof Types.ObjectId) return String(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(comparableValue);
  if (!value || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .filter((key) => key !== "__v" && key !== "_id")
      .sort()
      .map((key) => [key, comparableValue(record[key])]),
  );
}

function stableValue(value: unknown) {
  return JSON.stringify(comparableValue(value));
}

export async function getBuilderBlocksForRequest(req: AuthRequest) {
  const policy = await resolvePolicy(req);
  const query: Record<string, unknown> = { isActive: true };

  if (!policy.unrestricted && !policy.globalActions.has("view")) {
    const ids = Object.entries(policy.blockActions)
      .filter(([, actions]) => actions.has("view"))
      .map(([id]) => id)
      .filter((id) => Types.ObjectId.isValid(id));

    if (ids.length === 0) return [];
    query._id = { $in: ids };
  }

  const blocks = await Block.find(query)
    .select(
      "name type description icon category version data settings elements contentFields defaultBlock isActive",
    )
    .sort({ category: 1, name: 1 })
    .lean();

  return blocks.map((block) => ({
    ...block,
    builderActions: effectiveActions(policy, String(block._id)),
  }));
}

export async function assertBuilderBlockAccess(
  req: AuthRequest,
  blocks: unknown,
  action: BuilderBlockAction = "create",
  operation = ACTION_LABELS[action],
) {
  const values = normalizedBlocks(blocks);
  if (values.length === 0) return null;

  const [policy, descriptors] = await Promise.all([
    resolvePolicy(req),
    describeBlocks(values),
  ]);

  return assertDescriptorsAction(policy, descriptors, action, operation);
}

export async function assertBuilderBlockMutationAccess(
  req: AuthRequest,
  {
    currentBlocks,
    nextBlocks,
    requirePublish = true,
  }: MutationAccessInput,
) {
  const currentValues = normalizedBlocks(currentBlocks);
  const nextValues = normalizedBlocks(nextBlocks);
  if (currentValues.length === 0 && nextValues.length === 0) return null;

  const [policy, currentDescriptors, nextDescriptors] = await Promise.all([
    resolvePolicy(req),
    describeBlocks(currentValues),
    describeBlocks(nextValues),
  ]);

  const currentByKey = new Map(
    currentDescriptors.map((descriptor, index) => [
      descriptorKey(descriptor, index),
      descriptor,
    ]),
  );
  const nextByKey = new Map(
    nextDescriptors.map((descriptor, index) => [
      descriptorKey(descriptor, index),
      descriptor,
    ]),
  );

  const created = nextDescriptors.filter(
    (descriptor, index) =>
      !currentByKey.has(descriptorKey(descriptor, index)),
  );
  const createError = await assertDescriptorsAction(
    policy,
    created,
    "create",
    "افزودن به صفحه‌ساز",
  );
  if (createError) return createError;

  const updated = nextDescriptors.filter((descriptor, index) => {
    const previous = currentByKey.get(descriptorKey(descriptor, index));
    return previous && stableValue(previous.raw) !== stableValue(descriptor.raw);
  });
  const removed = currentDescriptors.filter(
    (descriptor, index) =>
      !nextByKey.has(descriptorKey(descriptor, index)),
  );
  const updateError = await assertDescriptorsAction(
    policy,
    [...updated, ...removed],
    "update",
    "ویرایش در صفحه‌ساز",
  );
  if (updateError) return updateError;

  if (requirePublish) {
    const publishError = await assertDescriptorsAction(
      policy,
      nextDescriptors,
      "publish",
      "ذخیره و انتشار",
    );
    if (publishError) return publishError;
  }

  return null;
}
