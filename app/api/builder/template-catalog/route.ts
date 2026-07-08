import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { getBuilderBlocksForRequest } from "@/lib/auth/builderBlockAccess";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import { withTemplateAccessScope } from "@/lib/auth/resourceScope";
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
    background:
      isRecord(template.background)
        ? template.background
        : undefined,
    logoHeader: isRecord(template.logoHeader) ? template.logoHeader : undefined,
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
      { message: "شناسه قالب معتبر نیست." },
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
    const templateQuery = await withTemplateAccessScope(req.ctx.user!, {
      _id: requestedTemplateId,
      isActive: true,
    });
    const template = (await Template.findOne(templateQuery)
      .select(
        "name description thumbnail background logoHeader style category blocks builderBlocks isActive",
      )
      .populate(
        "blocks",
        "name type icon data settings elements version isActive",
      )
      .lean()) as TemplateRecord | null;

    if (
      !template ||
      (getId(template.category) &&
        !(await Category.exists({
          _id: getId(template.category),
          isActive: { $ne: false },
        }))) ||
      !templateUsesAllowedBlocks(
        template,
        allowedBlockIds,
        allowedBlockTypes,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "قالب پیدا نشد یا برای استفاده از بلاک‌های آن دسترسی ندارید.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ template });
  }

  const templateQuery = await withTemplateAccessScope(req.ctx.user!, {
    isActive: true,
  });
  const templates = await Template.find(templateQuery)
    .select(
      "name description thumbnail background logoHeader style category blocks builderBlocks isActive",
    )
    .populate("blocks", "name type version isActive")
    .sort({ name: 1 })
    .lean();

  const blockAllowedTemplates = (templates as TemplateRecord[]).filter(
    (template) =>
      templateUsesAllowedBlocks(
        template,
        allowedBlockIds,
        allowedBlockTypes,
      ),
  );
  const categoryIds = [
    ...new Set(
      blockAllowedTemplates
        .map((template) => getId(template.category))
        .filter(Boolean),
    ),
  ];
  const categories = await Category.find({
    _id: { $in: categoryIds },
    isActive: { $ne: false },
  })
    .select("name description")
    .sort({ name: 1 })
    .lean();
  const activeCategoryIds = new Set(
    categories.map((category) => String(category._id)),
  );
  const availableTemplates = blockAllowedTemplates.filter((template) => {
    const categoryId = getId(template.category);
    return !categoryId || activeCategoryIds.has(categoryId);
  });

  return NextResponse.json({
    categories: categories.map((category) =>
      normalizeCategory(category as Record<string, unknown>),
    ),
    templates: availableTemplates.map(normalizeTemplateSummary),
  });
});
