// import mongoose, { Schema, Document, Model } from "mongoose";

// // The style object is a CSS-in-JS map that styled-components applies directly.
// // Keys are camelCase CSS properties, values are strings or numbers.
// export type StyleMap = Record<string, string | number>;

// // BlockData holds what the block actually renders — text, images, links, etc.
// // Kept as a generic record so each block type can define its own shape.
// export type BlockData = Record<string, unknown>;

// // BlockSettings holds component-level behaviour config — not visual, not content.
// // e.g. { autoplay: true, loop: false, columns: 3 }
// export type BlockSettings = Record<string, unknown>;

// export type BlockType =
//     | "hero"
//     | "navbar"
//     | "footer"
//     | "gallery"
//     | "text"
//     | "cta"
//     | "card"
//     | "form"
//     | "social"
//     | "map"
//     | "video"
//     | "faq"
//     | "pricing"
//     | string; // allow custom types

// export interface IBlock extends Document {
//     name: string;
//     type: BlockType;

//     // Content — what the block renders
//     data: BlockData;

//     // Behaviour config — component settings
//     settings: BlockSettings;

//     // Visual — CSS-in-JS object consumed by styled-components
//     style: StyleMap;

//     icon: string;
//     isActive: boolean;

//     // Usage stats — how many pages/templates use this block
//     stats: {
//         usageCount: number;
//     };

//     createdAt: Date;
//     updatedAt: Date;
// }

// const BlockSchema = new Schema<IBlock>(
//     {
//         name: { type: String, required: true, trim: true },

//         type: { type: String, required: true, trim: true, index: true },

//         data: { type: Schema.Types.Mixed, required: true, default: {} },

//         settings: { type: Schema.Types.Mixed, default: {} },

//         style: { type: Schema.Types.Mixed, required: true, default: {} },

//         icon: { type: String, required: true, trim: true },

//         isActive: { type: Boolean, default: true, index: true },

//         stats: {
//             usageCount: { type: Number, default: 0, min: 0 },
//         },
//     },
//     { timestamps: true }
// );



// const Block: Model<IBlock> =
//     mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

// export default Block;
import mongoose, { Schema, Document, Model } from "mongoose";
import type { ContentField, PageBlock } from "@/types/blocks/builder.types";

export type ResponsiveValue<T> = {
    mobile?: T;
    tablet?: T;
    desktop?: T;
};

export type AnimationType =
    | "none"
    | "fade"
    | "slideUp"
    | "scale"
    | "pulse";

export type EditableStyleKey =
    | "color"
    | "backgroundColor"
    | "fontSize"
    | "borderRadius"
    | "borderColor"
    | "borderWidth"
    | "animation";

export type EditableStyleMap = {
    color?: ResponsiveValue<string>;
    backgroundColor?: ResponsiveValue<string>;
    fontSize?: ResponsiveValue<number>;
    borderRadius?: ResponsiveValue<number>;
    borderColor?: ResponsiveValue<string>;
    borderWidth?: ResponsiveValue<number>;
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
    | "video"
    | "testimonial"
    | "contactInfo"
    | "mapLinks"
    | "messengerLinks"
    | "cta"
    | "countdown"
    | "faq"
    | "richText"
    | "slider"
    | "separator"
    | "storyHighlights"
    | "productCards"
    | "bookingForm"
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
    { timestamps: true }
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
