import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    jason: {
        type: Object,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    isactive: {
        type: Boolean,
        required: true,
    },
    style: {
        type: Object,
        required: true,
    },
    stats: {
        type: Object,
        required: true,
    },  
    data: {
        type: Object,
        required: true,
    },
});

const Block = mongoose.model("Block", blockSchema);

export default Block;