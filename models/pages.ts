// import mongoose, { Schema, Document, Model, Types } from "mongoose";
// import { BlockData, BlockSettings, StyleMap } from "./blocks";

// // A block embedded inside a page is a snapshot of the master Block at the time
// // it was added. Edits here don't affect the master block and vice versa.
// export interface PageBlock {
//     blockId: Types.ObjectId;   // ref back to master Block (for sync if needed)
//     type: string;
//     order: number;             // render order on the page

//     // Snapshot of master block data — page owner can override
//     data: BlockData;
//     settings: BlockSettings;

//     // Style overrides on top of the template skin.
//     // Merged with template.style at render time: template style < block style < pageBlock styleOverride
//     styleOverride: StyleMap;
// }

// export interface IPage extends Document {
//     title: string;
//     description?: string;
//     url: string;               // unique slug

//     owner: Types.ObjectId;

//     // Template provides the global style skin
//     template?: Types.ObjectId;

//     // Embedded block snapshots — ordered array
//     blocks: PageBlock[];

//     // Page-level style overrides on top of template (optional)
//     styleOverride?: StyleMap;

//     // Media
//     logo?: string;
//     favicon?: string;

//     // SEO
//     seo: {
//         title?: string;
//         description?: string;
//         keywords?: string[];
//     };

//     // Feature flags / integrations
//     extraServices?: Record<string, unknown>;
//     subscription?: Record<string, unknown>;
//     settings?: Record<string, unknown>;

//     stats: {
//         views: number;
//         visitors: number;
//     };

//     isPublished: boolean;

//     createdAt: Date;
//     updatedAt: Date;
// }

// const PageBlockSchema = new Schema<PageBlock>(
//     {
//         blockId:       { type: Schema.Types.ObjectId, ref: "Block", required: true },
//         type:          { type: String, required: true },
//         order:         { type: Number, required: true, default: 0 },
//         data:          { type: Schema.Types.Mixed, default: {} },
//         settings:      { type: Schema.Types.Mixed, default: {} },
//         styleOverride: { type: Schema.Types.Mixed, default: {} },
//     },
//     { _id: false }
// );

// const PageSchema = new Schema<IPage>(
//     {
//         title:       { type: String, required: true, trim: true },
//         description: { type: String, trim: true },
//         url:         { type: String, required: true, unique: true, trim: true, index: true },

//         owner:    { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
//         template: { type: Schema.Types.ObjectId, ref: "Template" },

//         blocks: { type: [PageBlockSchema], default: [] },

//         styleOverride: { type: Schema.Types.Mixed, default: {} },

//         logo:    { type: String, trim: true },
//         favicon: { type: String, trim: true },

//         seo: {
//             title:       String,
//             description: String,
//             keywords:    [String],
//         },

//         extraServices: { type: Schema.Types.Mixed, default: {} },
//         subscription:  { type: Schema.Types.Mixed, default: {} },
//         settings:      { type: Schema.Types.Mixed, default: {} },

//         stats: {
//             views:    { type: Number, default: 0, min: 0 },
//             visitors: { type: Number, default: 0, min: 0 },
//         },

//         isPublished: { type: Boolean, default: false, index: true },
//     },
//     { timestamps: true }
// );

// PageSchema.set("toJSON", {
//     transform: (_doc, ret) => {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//     },
// });

// const Page: Model<IPage> =
//     mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

// export default Page;
// src/models/pages.ts

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/* ================================================================== */
/*  Shared Builder Types                                               */
/* ================================================================== */

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
    | "height"
    | "borderRadius"
    | "borderColor"
    | "borderWidth"
    | "animation";

export type EditableStyleMap = {
    color?: ResponsiveValue<string>;
    backgroundColor?: ResponsiveValue<string>;
    fontSize?: ResponsiveValue<number>;
    height?: ResponsiveValue<number>;
    borderRadius?: ResponsiveValue<number>;
    borderColor?: ResponsiveValue<string>;
    borderWidth?: ResponsiveValue<number>;
    animation?: AnimationType;
};

export type PageBlockElement = {
    label: string;
    allowedStyleKeys: EditableStyleKey[];
    style: EditableStyleMap;
};

export type PageBlockData = Record<string, unknown>;

export type PageBlockSettings = {
    direction?: "rtl" | "ltr";
    [key: string]: unknown;
};

export type PageStyleOverride = Record<string, unknown>;

export type PageBackground = {
    color: string;
    image: string;
};

/* ================================================================== */
/*  Embedded Page Block                                                */
/* ================================================================== */

// A page block is a full snapshot of what the user edited in the builder.
// It may come from a master Block document, or it may come only from frontend blockRegistry.
export interface PageBlock {
    // Frontend unique instance id.
    // This is what drag/drop, selection, editing, and rendering use.
    instanceId: string;
    hidden?: boolean;


    // Optional reference to master Block.
    // Not required because many blocks are created from frontend blockRegistry.
    blockId?: Types.ObjectId;

    type: string;
    version: number;
    order: number;
    isActive: boolean;

    // Content: texts, images, links, product arrays, story arrays, etc.
    data: PageBlockData;

    // Behavior/settings: direction, autoplay, loop, controls, etc.
    settings: PageBlockSettings;

    // Editable visual elements:
    // container, title, description, button, image, icon, etc.
    elements: Record<string, PageBlockElement>;

    // Optional future override layer.
    // Keep it for page/template skin overrides if needed later.
    styleOverride?: PageStyleOverride;
}

/* ================================================================== */
/*  Page Document                                                      */
/* ================================================================== */

export interface IPage extends Document {
    title: string;
    description?: string;

    // Unique public slug/url.
    url: string;

    owner: Types.ObjectId;

    // Optional template reference.
    template?: Types.ObjectId;

    // Full embedded editable blocks.
    blocks: PageBlock[];

    // Page-level style overrides.
    styleOverride?: PageStyleOverride;

    background: PageBackground;

    // Media
    logo?: string;
    logoShape: "square" | "circle";
    favicon?: string;
    thumbnail?: string;

    // SEO
    seo: {
        title?: string;
        description?: string;
        keywords?: string[];
        canonical?: string;
        ogImage?: string;
    };

    // Feature flags / integrations / misc settings
    extraServices?: Record<string, unknown>;
    subscription?: Record<string, unknown>;
    settings?: Record<string, unknown>;

    stats: {
        views: number;
        visitors: number;
    };

    isPublished: boolean;
    expiresAt?: Date | null;

    publishedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

/* ================================================================== */
/*  Schemas                                                            */
/* ================================================================== */

const PageBlockSchema = new Schema<PageBlock>(
    {
        instanceId: {
            type: String,
            required: true,
            trim: true,
        },

        blockId: {
            type: Schema.Types.ObjectId,
            ref: "Block",
            required: false,
        },

        type: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        version: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },

        order: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        data: {
            type: Schema.Types.Mixed,
            default: {},
        },

        settings: {
            type: Schema.Types.Mixed,
            default: { direction: "rtl" },
        },

        elements: {
            type: Schema.Types.Mixed,
            default: {},
        },

        styleOverride: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        _id: false,
    }
);

const PageSchema = new Schema<IPage>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        url: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        template: {
            type: Schema.Types.ObjectId,
            ref: "Template",
        },

        blocks: {
            type: [PageBlockSchema],
            default: [],
        },

        styleOverride: {
            type: Schema.Types.Mixed,
            default: {},
        },

        background: {
            color: {
                type: String,
                trim: true,
                default: "#ffffff",
            },
            image: {
                type: String,
                trim: true,
                default: "",
            },
        },

        logo: {
            type: String,
            trim: true,
        },

        logoShape: {
            type: String,
            enum: ["square", "circle"],
            default: "square",
        },

        favicon: {
            type: String,
            trim: true,
        },

        thumbnail: {
            type: String,
            trim: true,
        },

        seo: {
            title: {
                type: String,
                trim: true,
            },
            description: {
                type: String,
                trim: true,
            },
            keywords: {
                type: [String],
                default: [],
            },
            canonical: {
                type: String,
                trim: true,
            },
            ogImage: {
                type: String,
                trim: true,
            },
        },

        extraServices: {
            type: Schema.Types.Mixed,
            default: {},
        },

        subscription: {
            type: Schema.Types.Mixed,
            default: {},
        },

        settings: {
            type: Schema.Types.Mixed,
            default: {},
        },

        stats: {
            views: {
                type: Number,
                default: 0,
                min: 0,
            },
            visitors: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        isPublished: {
            type: Boolean,
            default: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

PageSchema.index({ isPublished: 1, expiresAt: 1 });
PageSchema.index({ expiresAt: 1 });
PageSchema.index({ owner: 1, updatedAt: -1 });
PageSchema.index({ owner: 1, createdAt: -1 });
PageSchema.index({ owner: 1, isPublished: 1, updatedAt: -1 });
PageSchema.index({ owner: 1, "stats.views": -1, _id: -1 });
PageSchema.index({ owner: 1, "stats.visitors": -1, _id: -1 });



/* ================================================================== */
/*  Model                                                              */
/* ================================================================== */

const Page: Model<IPage> =
    mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
