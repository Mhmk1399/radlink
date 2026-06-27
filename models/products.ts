import mongoose, { type Model } from "mongoose";

export interface IProduct {
    name: string;
    description?: string;
    price: number;
    images: string[];
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
    images: [
        {
            type: String,
            trim: true,
        }
    ],
}, {
    timestamps: true,
});

const Product: Model<IProduct> =
    mongoose.models.Product ||
    mongoose.model<IProduct>("Product", productSchema);

export default Product;
