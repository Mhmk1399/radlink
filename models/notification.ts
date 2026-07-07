import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";
import {
    NOTIFICATION_ICON_KEYS,
    type NotificationIconKey,
} from "@/lib/notifications/notificationIcons";

export interface INotification extends Document {
    page?: Types.ObjectId;
    title: string;
    subtitle?: string;
    description: string;
    type: "info" | "danger";
    iconKey?: NotificationIconKey | "";
    closeable: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
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
        type: {
            type: String,
            enum: ["info", "danger"],
            required: true,
            default: "info",
            index: true,
        },
        iconKey: {
            type: String,
            enum: ["", ...NOTIFICATION_ICON_KEYS],
            trim: true,
            default: "",
        },
        closeable: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
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

notificationSchema.index({ page: 1, isActive: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, isActive: 1, createdAt: -1 });
notificationSchema.index({ isActive: 1, createdAt: -1 });

const Notification: Model<INotification> =
    (mongoose.models.Notification as Model<INotification> | undefined) ||
    mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
