import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { getBuilderBlocksForRequest } from "@/lib/auth/builderBlockAccess";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import type { AuthRequest } from "@/lib/auth/types";
import Category from "@/models/category";
import Template from "@/models/template";
import "@/models/blocks";

type TemplateRecord = Record<string, unknown> & {
  _id?: unknown;
  category?: unknown;
  blocks?: unknown;
  builderBlocks?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getId(value: unknown) {
  if (value instanceof mongoose.Types.ObjectId) return String(value);
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  return String(value._id ?? value.id ?? "");
}

function getBlockType(value: unknown) {
  if (!isRecord(value)) return "";
  return typeof value.type === "string" ? value.type : "";
}

async function canCreateBuilderPage(req: AuthRequest) {
  const user = req.ctx.user!;
  if (user.role === "superAdmin") return true;

  const access = await resolveUserAccess(String(user._id), user.permissions);
  return access.components["builder.page"]?.has("create") ?? false;
}

function templateUsesAllowedBlocks(
  template: TemplateRecord,
  allowedBlockIds: Set<string>,
  allowedBlockTypes: Set<string>,
) {
  const builderBlocks = Array.isArray(template.builderBlocks)
    ? template.builderBlocks
    : [];
  const legacyBlocks = Array.isArray(template.blocks) ? template.blocks : [];
  const blocks = builderBlocks.length > 0 ? builderBlocks : legacyBlocks;

  return blocks.every((block) => {
    const blockId = isRecord(block)
      ? getId(block.blockId ?? block._id ?? block.id)
      : getId(block);
    const type = getBlockType(block);

    if (blockId && mongoose.Types.ObjectId.isValid(blockId)) {
      return allowedBlockIds.has(blockId);
    }

    return Boolean(type && allowedBlockTypes.has(type));
  });
}

function normalizeCategory(category: Record<string, unknown>) {
  const id = getId(category);
  return {
    id,
    name: typeof category.name === "string" ? category.name : "بدون نام",
    description:
      typeof category.description === "string" ? category.description : "",
  };
}

function normalizeTemplateSummary(template: TemplateRecord) {
  const id = getId(template);
  const categoryId = getId(template.category);

  return {
    id,
    name: typeof template.name === "string" ? template.name : "بدون نام",
    description:
      typeof template.description === "string" ? template.description : "",
    thumbnail:
      typeof template.thumbnail === "string" ? template.thumbnail : "",
    categoryId,
  };
}

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest) => {
  if (!(await canCreateBuilderPage(req))) {
    return NextResponse.json(
      {
        code: "ACCESS_DENIED",
        message: "شما دسترسی ساخت صفحه در صفحه‌ساز را ندارید.",
      },
      { status: 403 },
    );
  }

  const requestedTemplateId = new URL(req.url).searchParams.get("id") ?? "";
  if (
    requestedTemplateId &&
    !mongoose.Types.ObjectId.isValid(requestedTemplateId)
  ) {
    return NextResponse.json(
      { message: "شناسه تمپلیت معتبر نیست." },
      { status: 400 },
    );
  }

  const allowedBlocks = await getBuilderBlocksForRequest(req);
  const allowedBlockIds = new Set(
    allowedBlocks.map((block) => String(block._id)),
  );
  const allowedBlockTypes = new Set(
    allowedBlocks.map((block) => String(block.type)),
  );

  if (requestedTemplateId) {
    const template = (await Template.findOne({
      _id: requestedTemplateId,
      isActive: true,
    })
      .select(
        "name description thumbnail category blocks builderBlocks isActive",
      )
      .populate(
        "blocks",
        "name type icon data settings elements version isActive",
      )
      .lean()) as TemplateRecord | null;

    if (
      !template ||
      !templateUsesAllowedBlocks(
        template,
        allowedBlockIds,
        allowedBlockTypes,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "تمپلیت پیدا نشد یا برای استفاده از بلاک‌های آن دسترسی ندارید.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ template });
  }

  const [categories, templates] = await Promise.all([
    Category.find()
      .select("name description")
      .sort({ name: 1 })
      .lean(),
    Template.find({ isActive: true })
      .select(
        "name description thumbnail category blocks builderBlocks isActive",
      )
      .populate("blocks", "name type version isActive")
      .sort({ name: 1 })
      .lean(),
  ]);

  const availableTemplates = (templates as TemplateRecord[]).filter(
    (template) =>
      templateUsesAllowedBlocks(
        template,
        allowedBlockIds,
        allowedBlockTypes,
      ),
  );

  return NextResponse.json({
    categories: categories.map((category) =>
      normalizeCategory(category as Record<string, unknown>),
    ),
    templates: availableTemplates.map(normalizeTemplateSummary),
  });
});
