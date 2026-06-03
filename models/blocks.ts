import mongoose, { Schema, Document, Model } from "mongoose";

// The style object is a CSS-in-JS map that styled-components applies directly.
// Keys are camelCase CSS properties, values are strings or numbers.
export type StyleMap = Record<string, string | number>;

// BlockData holds what the block actually renders — text, images, links, etc.
// Kept as a generic record so each block type can define its own shape.
export type BlockData = Record<string, unknown>;

// BlockSettings holds component-level behaviour config — not visual, not content.
// e.g. { autoplay: true, loop: false, columns: 3 }
export type BlockSettings = Record<string, unknown>;

export type BlockType =
    | "hero"
    | "navbar"
    | "footer"
    | "gallery"
    | "text"
    | "cta"
    | "card"
    | "form"
    | "social"
    | "map"
    | "video"
    | "faq"
    | "pricing"
    | string; // allow custom types

export interface IBlock extends Document {
    name: string;
    type: BlockType;

    // Content — what the block renders
    data: BlockData;

    // Behaviour config — component settings
    settings: BlockSettings;

    // Visual — CSS-in-JS object consumed by styled-components
    style: StyleMap;

    icon: string;
    isActive: boolean;

    // Usage stats — how many pages/templates use this block
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

        data: { type: Schema.Types.Mixed, required: true, default: {} },

        settings: { type: Schema.Types.Mixed, default: {} },

        style: { type: Schema.Types.Mixed, required: true, default: {} },

        icon: { type: String, required: true, trim: true },

        isActive: { type: Boolean, default: true, index: true },

        stats: {
            usageCount: { type: Number, default: 0, min: 0 },
        },
    },
    { timestamps: true }
);

BlockSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Block: Model<IBlock> =
    mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

export default Block;
