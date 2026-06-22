import mongoose, { Model, Types } from "mongoose";

export interface IFile {
    filename: string;
    path: string;
    owner: Types.ObjectId;
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
});

const File: Model<IFile> =
    mongoose.models.File || mongoose.model<IFile>("File", fileSchema);

export default File;
