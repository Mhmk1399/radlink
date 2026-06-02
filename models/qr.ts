import mongoose from "mongoose";    

const qrSchema = new mongoose.Schema({
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetUrl: {
        type: String,
        required: true,
    },
    imageurl: {
        type: String,
    },
    shortcode: {
        type: String,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

export default mongoose.model("QR", qrSchema);