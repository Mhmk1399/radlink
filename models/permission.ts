import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPermission extends Document {
    name: string;
    description?: string;

    accesses: Types.ObjectId[];

    assignedToUsers: Types.ObjectId[];

    grantedBy?: Types.ObjectId;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        accesses: [
            { type: Schema.Types.ObjectId, ref: "Access", required: true }
        ],

        assignedToUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },
        ],

        grantedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

PermissionSchema.index({
    assignedToUsers: 1,
    isActive: 1,
});

PermissionSchema.set("toJSON", {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Permission: Model<IPermission> =
    mongoose.models.Permission ||
    mongoose.model<IPermission>("Permission", PermissionSchema);

export default Permission;