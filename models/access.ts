import mongoose, { Schema, Document, Types } from "mongoose";

export type AccessAction = "view" | "create" | "update" | "delete" | "publish";

export interface IAccess extends Document {
    // For static components (frontend hardcoded)
    staticComponents: {
        componentName: string; // e.g., "dashboard.reports", "landing.builder"
        actions: AccessAction[];
    }[];

    // For dynamic objects in DB
    dynamicAccess: {
        templates: {
            templateId: Types.ObjectId;
            actions: AccessAction[];
        }[];
        blocks: {
            blockId: Types.ObjectId;
            actions: AccessAction[];
        }[];
        pages: {
            pageId: Types.ObjectId;
            actions: AccessAction[];
        }[];
    };
}

const AccessSchema = new Schema<IAccess>(
    {
        staticComponents: [
            {
                componentName: { type: String, required: true },
                actions: [{ type: String, enum: ["view", "create", "update", "delete", "publish"], required: true }],
            },
        ],
        dynamicAccess: {
            templates: [
                {
                    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
                    actions: [{ type: String, enum: ["view", "create", "update", "delete", "publish"], required: true }],
                },
            ],
            blocks: [
                {
                    blockId: { type: Schema.Types.ObjectId, ref: "Block" },
                    actions: [{ type: String, enum: ["view", "create", "update", "delete", "publish"], required: true }],
                },
            ],
            pages: [
                {
                    pageId: { type: Schema.Types.ObjectId, ref: "Page" },
                    actions: [{ type: String, enum: ["view", "create", "update", "delete", "publish"], required: true }],
                },
            ],
        },
    },
    { timestamps: true }
);

const Access = mongoose.models.Access || mongoose.model<IAccess>("Access", AccessSchema);

export default Access;