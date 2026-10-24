import mongoose, { Schema, Document, Model } from "mongoose";
import type { ContentField, PageBlock } from "@/types/blocks/builder.types";

export type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};

export type AnimationType = "none" | "fade" | "slideUp" | "scale" | "pulse";

export type EditableStyleKey =
  | "color"
  | "backgroundColor"
  | "fontSize"
  | "height"
  | "gridColumns"
  | "textAlign"
  | "contentAlign"
  | "marginTop"
  | "marginBottom"
  | "paddingTop"
  | "paddingBottom"
  | "borderRadius"
  | "borderColor"
  | "borderWidth"
  | "shadow"
  | "animation";

export type ShadowStyleValue = {
  color?: string;
  intensity?: number;
};

export type TextAlignValue = "left" | "center" | "right";
export type ContentAlignValue = "left" | "center" | "right";

export type EditableStyleMap = {
  color?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<number>;
  height?: ResponsiveValue<number>;
  gridColumns?: ResponsiveValue<number>;
  textAlign?: ResponsiveValue<TextAlignValue>;
  contentAlign?: ResponsiveValue<ContentAlignValue>;
  marginTop?: ResponsiveValue<number>;
  marginBottom?: ResponsiveValue<number>;
  paddingTop?: ResponsiveValue<number>;
  paddingBottom?: ResponsiveValue<number>;
  borderRadius?: ResponsiveValue<number>;
  borderColor?: ResponsiveValue<string>;
  borderWidth?: ResponsiveValue<number>;
  shadow?: ResponsiveValue<ShadowStyleValue>;
  animation?: AnimationType;
};

export type BlockElement = {
  label: string;
  style: EditableStyleMap;
  allowedStyleKeys: EditableStyleKey[];
};

export type BlockData = Record<string, unknown>;

export type BlockSettings = {
  direction?: "rtl" | "ltr";
  [key: string]: unknown;
};

export type BlockType =
  | "banner"
  | "simpleLink"
  | "superLink"
  | "audio"
  | "video"
  | "testimonial"
  | "contactInfo"
  | "contactSave"
  | "mapLinks"
  | "messengerLinks"
  | "cta"
  | "countdown"
  | "faq"
  | "richText"
  | "slider"
  | "gallery"
  | "separator"
  | "storyHighlights"
  | "productCards"
  | "bookingForm"
  | "bankAccount"
  | "pdfDownloads"
  | string;

export interface IBlock extends Document {
  name: string;
  type: BlockType;

  description?: string;
  icon: string;
  category?: string;

  version: number;

  data: BlockData;
  settings: BlockSettings;

  // New builder style system
  elements: Record<string, BlockElement>;
  contentFields: ContentField[];
  defaultBlock: PageBlock;

  isActive: boolean;

  stats: {
    usageCount: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    name: { type: String, required: true, trim: true },

    type: { type: String, required: true, trim: true, index: true },

    description: { type: String, trim: true },

    icon: { type: String, required: true, trim: true },

    category: { type: String, trim: true, index: true },

    version: { type: Number, default: 1, min: 1 },

    data: { type: Schema.Types.Mixed, required: true, default: {} },

    settings: { type: Schema.Types.Mixed, default: { direction: "rtl" } },

    elements: { type: Schema.Types.Mixed, required: true, default: {} },

    contentFields: { type: Schema.Types.Mixed, default: [] },

    defaultBlock: { type: Schema.Types.Mixed, default: {} },

    isActive: { type: Boolean, default: true, index: true },

    stats: {
      usageCount: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);

BlockSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const Block: Model<IBlock> =
  mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

export default Block;
