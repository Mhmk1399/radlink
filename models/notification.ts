import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        required: true,
    },
    closeable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isGlobal: {
        type: Boolean,
        default: false,
    },
});

const Notification: mongoose.Model<any> =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

export default Notification;
