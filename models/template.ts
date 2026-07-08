import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { LogoHeaderSettings } from "@/lib/design/logo-header";

type StyleMap = Record<string, unknown>;

export type TemplateBackground = {
    color: string;
    image: string;
};

// Full design token set — the visual skin of the template.
// Consumed by styled-components on the frontend.
export interface TemplateStyle {
    // Typography
    fontFamily?: string;
    fontSizeBase?: string;   // e.g. "16px"
    lineHeight?: string;

    // Color palette
    colors: {
        primary: string;
        secondary: string;
        accent?: string;
        background: string;
        surface?: string;     // card/panel background
        text: string;
        textMuted?: string;
        border?: string;
    };

    // Spacing scale
    spacing?: {
        xs?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };

    // Button token overrides (styled-components picks these up)
    button?: StyleMap;

    // Card token overrides
    card?: StyleMap;

    // Background image for the full page canvas
    bgImage?: string;

    // Any extra arbitrary CSS tokens
    extra?: StyleMap;
}

export interface ITemplate extends Document {
    name: string;
    description?: string;
    thumbnail?: string;       // preview image URL

    // The full style skin — consumed by styled-components
    style: TemplateStyle;
    background: TemplateBackground;
    logoHeader: LogoHeaderSettings;

    category?: Types.ObjectId;

    // Ordered default blocks used when a page is created from this template
    blocks: Types.ObjectId[];

    // Full builder snapshots for templates created from the visual builder.
    // Kept alongside legacy Block refs so older templates continue to work.
    builderBlocks: Record<string, unknown>[];

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const TemplateStyleSchema = new Schema(
    {
        fontFamily: String,
        fontSizeBase: String,
        lineHeight: String,
        colors: {
            primary:    { type: String, required: true },
            secondary:  { type: String, required: true },
            accent:     String,
            background: { type: String, required: true },
            surface:    String,
            text:       { type: String, required: true },
            textMuted:  String,
            border:     String,
        },
        spacing: {
            xs: String,
            sm: String,
            md: String,
            lg: String,
            xl: String,
        },
        button: { type: Schema.Types.Mixed, default: {} },
        card:   { type: Schema.Types.Mixed, default: {} },
        bgImage: String,
        extra:  { type: Schema.Types.Mixed, default: {} },
    },
    { _id: false }
);

const TemplateSchema = new Schema<ITemplate>(
    {
        name:        { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        thumbnail:   { type: String, trim: true },

        style: { type: TemplateStyleSchema, required: true },
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
        logoHeader: { type: Schema.Types.Mixed, default: {} },

        category: { type: Schema.Types.ObjectId, ref: "Category", index: true },

        blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],

        builderBlocks: { type: Schema.Types.Mixed, default: [] },

        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

TemplateSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const obj = ret as unknown as Record<string, unknown>;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        return ret;
    },
});

const Template: Model<ITemplate> =
    mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;
