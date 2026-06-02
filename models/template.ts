import mongoose from "mongoose";    
const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    font: {
        type: String,
    },
    colors: {
        primary: {
            type: String,
        },
        secondary: {
            type: String,
        },
        textColors: {
            type: String,
        },
    },
    bgimage: {
        type: String,
    },
    btnsettings: {
        type: Object,
    },
    cardsettings: {
        type: Object,
    },
    category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",    
    },
    blocks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Block",
        }
    ],
});

const Template = mongoose.model("Template", templateSchema);

export default Template;