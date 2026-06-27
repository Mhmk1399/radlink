import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

export interface INotification extends Document {
    page?: Types.ObjectId;
    title: string;
    subtitle?: string;
    description: string;
    closeable: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Legacy fields are kept readable while existing records are migrated.
    User?: Types.ObjectId;
    message?: string;
    isGlobal?: boolean;
}

const notificationSchema = new Schema<INotification>(
    {
        page: {
            type: Schema.Types.ObjectId,
            ref: "Page",
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        subtitle: {
            type: String,
            trim: true,
            maxlength: 180,
            default: "",
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        closeable: {
            type: Boolean,
            default: true,
        },

        // Legacy compatibility. New API writes do not use these fields.
        User: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        message: {
            type: String,
            trim: true,
        },
        isGlobal: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

notificationSchema.index({ page: 1, createdAt: -1 });

const Notification: Model<INotification> =
    (mongoose.models.Notification as Model<INotification> | undefined) ||
    mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
