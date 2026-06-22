import { Types } from "mongoose";
import { NextResponse } from "next/server";
import type { AuthRequest } from "@/lib/auth/types";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import Block from "@/models/blocks";

type BlockLike = {
  blockId?: unknown;
  _id?: unknown;
  id?: unknown;
  type?: unknown;
};

function objectIdString(value: unknown) {
  if (value instanceof Types.ObjectId) return String(value);
  if (typeof value === "string") {
    return Types.ObjectId.isValid(value) ? value : null;
  }

  const id =
    typeof value === "object" && value !== null
      ? String((value as Record<string, unknown>)._id ?? (value as Record<string, unknown>).id ?? "")
      : String(value ?? "");

  return Types.ObjectId.isValid(id) ? id : null;
}

function blockType(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function collectRequestedBlockRefs(blocks: unknown[]) {
  const ids = new Set<string>();
  const types = new Set<string>();

  blocks.forEach((item) => {
    const directId = objectIdString(item);
    if (directId) ids.add(directId);

    const block = item && typeof item === "object" ? (item as BlockLike) : {};
    const id = objectIdString(block.blockId ?? block._id ?? block.id);
    const type = blockType(block.type);

    if (id) ids.add(id);
    if (type) types.add(type);
  });

  return { ids: [...ids], types: [...types] };
}

async function getAllowedBlockIds(req: AuthRequest) {
  const user = req.ctx?.user;
  if (!user) return new Set<string>();
  if (user.role === "superAdmin") return null;

  const resolved = await resolveUserAccess(String(user._id), user.permissions);
  const canUseAllBlocks =
    resolved.components["admin.blocks"]?.has("create") ?? false;

  if (canUseAllBlocks) return null;

  return new Set(
    Object.entries(resolved.blocks)
      .filter(([, actions]) => actions.has("create"))
      .map(([id]) => id),
  );
}

export async function getBuilderBlocksForRequest(req: AuthRequest) {
  const allowedIds = await getAllowedBlockIds(req);
  const query: Record<string, unknown> = { isActive: true };

  if (allowedIds) {
    const ids = [...allowedIds].filter((id) => Types.ObjectId.isValid(id));
    if (ids.length === 0) return [];
    query._id = { $in: ids };
  }

  return Block.find(query)
    .select("name type description icon category version data settings elements contentFields defaultBlock isActive")
    .sort({ category: 1, name: 1 })
    .lean();
}

export async function assertBuilderBlockAccess(
  req: AuthRequest,
  blocks: unknown,
) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  const allowedIds = await getAllowedBlockIds(req);
  if (!allowedIds) return null;

  const refs = collectRequestedBlockRefs(blocks);
  if (refs.ids.length === 0 && refs.types.length === 0) {
    return NextResponse.json(
      {
        code: "ACCESS_DENIED",
        message: "اطلاعات بلاک‌های صفحه برای بررسی دسترسی معتبر نیست.",
        requiredAccess: {
          resource: "blocks",
          action: "create",
        },
      },
      { status: 403 },
    );
  }

  const foundBlocks = await Block.find({
    isActive: true,
    $or: [
      ...(refs.ids.length > 0 ? [{ _id: { $in: refs.ids } }] : []),
      ...(refs.types.length > 0 ? [{ type: { $in: refs.types } }] : []),
    ],
  })
    .select("_id type name")
    .lean();

  const idByType = new Map(foundBlocks.map((block) => [String(block.type), String(block._id)]));
  const validIds = new Set(foundBlocks.map((block) => String(block._id)));

  const denied = blocks.find((item) => {
    const directId = objectIdString(item);
    const block = item && typeof item === "object" ? (item as BlockLike) : {};
    const requestedId = objectIdString(block.blockId ?? block._id ?? block.id);
    const requestedType = blockType(block.type);
    const resolvedId = directId ?? requestedId ?? (requestedType ? idByType.get(requestedType) : null);

    return !resolvedId || !validIds.has(resolvedId) || !allowedIds.has(resolvedId);
  });

  if (!denied) return null;

  const deniedBlock = denied as BlockLike;
  const label = blockType(deniedBlock.type) ?? objectIdString(deniedBlock.blockId) ?? "این بلاک";

  return NextResponse.json(
    {
      code: "ACCESS_DENIED",
      message: `شما دسترسی ساخت صفحه با بلاک «${label}» را ندارید.`,
      requiredAccess: {
        resource: "blocks",
        action: "create",
      },
    },
    { status: 403 },
  );
}
