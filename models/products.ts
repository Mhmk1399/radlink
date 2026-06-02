import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [
        {
            type: String,
        }
    ],
});

const Product = mongoose.model("Product", productSchema);

export default Product;