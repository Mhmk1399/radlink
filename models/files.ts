import mongoose, { Model, Types } from "mongoose";

export type FileKind = "upload" | "qr" | "ticket";

export interface IFile {
    filename: string;
    path: string;
    owner: Types.ObjectId;
    mimeType?: string;
    size?: number;
    kind: FileKind;
    page?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    mimeType: {
        type: String,
        trim: true,
    },
    size: {
        type: Number,
        min: 0,
    },
    kind: {
        type: String,
        enum: ["upload", "qr", "ticket"],
        default: "upload",
        index: true,
    },
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
        index: true,
    },
}, {
    timestamps: true,
});

fileSchema.index({ owner: 1, kind: 1 });

const File: Model<IFile> =
    mongoose.models.File || mongoose.model<IFile>("File", fileSchema);

export default File;
