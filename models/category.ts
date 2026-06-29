import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description?: string;
    templates: Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        templates: [
            {
                type: Schema.Types.ObjectId,
                ref: "Template",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

CategorySchema.set("toJSON", {
    transform: (_doc, ret) => {
        const obj = ret as unknown as Record<string, unknown>;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        return ret;
    },
});

const Category: Model<ICategory> =
    mongoose.models.Category ||
    mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
