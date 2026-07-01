import mongoose, { type Model, type Types } from "mongoose";

export interface IProduct {
    name: string;
    description?: string;
    price: number;
    displayPrice?: string;
    oldPrice?: string;
    image?: string;
    imageFile?: Types.ObjectId;
    owner: Types.ObjectId;
    page?: Types.ObjectId;
    source: "manual" | "builder";
    sourceBlockInstanceId?: string;
    sourceItemId?: string;
    productUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 3000,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    displayPrice: {
        type: String,
        trim: true,
    },
    oldPrice: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    imageFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
        index: true,
    },
    source: {
        type: String,
        enum: ["manual", "builder"],
        default: "manual",
        index: true,
    },
    sourceBlockInstanceId: {
        type: String,
        trim: true,
    },
    sourceItemId: {
        type: String,
        trim: true,
    },
    productUrl: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

productSchema.index(
    { page: 1, sourceBlockInstanceId: 1, sourceItemId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            source: "builder",
            page: { $exists: true },
            sourceBlockInstanceId: { $type: "string" },
            sourceItemId: { $type: "string" },
        },
    },
);
productSchema.index({ owner: 1, createdAt: -1 });

const Product: Model<IProduct> =
    mongoose.models.Product ||
    mongoose.model<IProduct>("Product", productSchema);

export default Product;
