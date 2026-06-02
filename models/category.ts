import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    templates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Template",
        }
    ],
});

const Category = mongoose.model("Category", categorySchema);

export default Category;