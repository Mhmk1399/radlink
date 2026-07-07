import mongoose, { type Model, type Types } from "mongoose";

export interface IQR {
    page: Types.ObjectId;
    owner: Types.ObjectId;
    file?: Types.ObjectId;
    targetUrl: string;
    imageurl?: string;
    shortcode: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const qrSchema = new mongoose.Schema<IQR>({
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
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
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
}, {
    timestamps: true,
});

qrSchema.index({ page: 1, isActive: 1 });
qrSchema.index({ owner: 1, createdAt: -1 });
qrSchema.index({ owner: 1, isActive: 1, createdAt: -1 });

const QR: Model<IQR> =
    mongoose.models.QR || mongoose.model<IQR>("QR", qrSchema);

export default QR;
