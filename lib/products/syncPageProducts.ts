import mongoose, { type Types } from "mongoose";
import File from "@/models/files";
import Product from "@/models/products";

type ProductSource = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  price?: unknown;
  oldPrice?: unknown;
  productUrl?: unknown;
};

type BlockSource = {
  instanceId?: unknown;
  type?: unknown;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function numericPrice(value: unknown) {
  const normalized = text(value, 120)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^\d.]/g, "");
  const price = Number(normalized);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

export async function syncPageProducts({
  pageId,
  ownerId,
  blocks,
}: {
  pageId: string | Types.ObjectId;
  ownerId: string | Types.ObjectId;
  blocks: unknown;
}) {
  const pageObjectId =
    typeof pageId === "string" ? new mongoose.Types.ObjectId(pageId) : pageId;
  const ownerObjectId =
    typeof ownerId === "string" ? new mongoose.Types.ObjectId(ownerId) : ownerId;
  const sourceBlocks = Array.isArray(blocks) ? (blocks as BlockSource[]) : [];
  const products: Array<{
    sourceBlockInstanceId: string;
    sourceItemId: string;
    name: string;
    description: string;
    imageUrl: string;
    displayPrice: string;
    price: number;
    oldPrice: string;
    productUrl: string;
  }> = [];

  sourceBlocks.forEach((block, blockIndex) => {
    if (block?.type !== "productCards" || !isRecord(block.data)) return;
    const blockInstanceId =
      text(block.instanceId, 160) || `productCards-${blockIndex}`;
    const items = Array.isArray(block.data.products)
      ? (block.data.products as ProductSource[])
      : [];

    items.forEach((item, itemIndex) => {
      const name = text(item?.name, 150);
      if (!name) return;
      const displayPrice = text(item.price, 120);
      products.push({
        sourceBlockInstanceId: blockInstanceId,
        sourceItemId: text(item.id, 160) || `product-${itemIndex}`,
        name,
        description: text(item.description, 3000),
        imageUrl: text(item.imageUrl, 2000),
        displayPrice,
        price: numericPrice(displayPrice),
        oldPrice: text(item.oldPrice, 120),
        productUrl: text(item.productUrl, 2000),
      });
    });
  });

  const imageUrls = [...new Set(products.map((item) => item.imageUrl).filter(Boolean))];
  const files = imageUrls.length
    ? await File.find({
        owner: ownerObjectId,
        path: { $in: imageUrls },
        kind: "upload",
      })
        .select("_id path")
        .lean()
    : [];
  const fileByPath = new Map(files.map((file) => [file.path, file._id]));

  if (files.length) {
    await File.updateMany(
      { _id: { $in: files.map((file) => file._id) }, owner: ownerObjectId },
      { $set: { page: pageObjectId } },
    );
  }

  const activeKeys = products.map((item) => ({
    sourceBlockInstanceId: item.sourceBlockInstanceId,
    sourceItemId: item.sourceItemId,
  }));

  if (products.length) {
    await Product.bulkWrite(
      products.map((item) => {
        const imageFileId = item.imageUrl
          ? fileByPath.get(item.imageUrl)
          : undefined;

        return {
          updateOne: {
            filter: {
              page: pageObjectId,
              source: "builder",
              sourceBlockInstanceId: item.sourceBlockInstanceId,
              sourceItemId: item.sourceItemId,
            },
            update: {
              $set: {
                owner: ownerObjectId,
                page: pageObjectId,
                source: "builder",
                name: item.name,
                description: item.description,
                price: item.price,
                displayPrice: item.displayPrice,
                oldPrice: item.oldPrice,
                productUrl: item.productUrl,
                image: item.imageUrl,
                ...(imageFileId ? { imageFile: imageFileId } : {}),
              },
              ...(!imageFileId ? { $unset: { imageFile: "" } } : {}),
            },
            upsert: true,
          },
        };
      }),
    );
  }

  await Product.deleteMany({
    page: pageObjectId,
    source: "builder",
    ...(activeKeys.length
      ? {
          $nor: activeKeys,
        }
      : {}),
  });
}
