import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "user" | "agent" | "admin" | "superAdmin";

export type UserStatus = "active" | "inactive";

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  agentid?: Types.ObjectId;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  passwordHash?: string;
  passwordChangedAt?: Date;

  nationalCode?: string;
  fatherName?: string;

  role: UserRole;
  status: UserStatus;

  permissions: Types.ObjectId[];

  limits: {
    files: number;
    blocks: number;
    pages: number;
  };

  lastLoginAt?: Date;
  lastOtpRequestAt?: Date;
  phoneVerifiedAt?: Date;

  isPhoneVerified: boolean;
  isDeleted: boolean;

  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 11,
      maxlength: 11,
      match: [/^\d{11}$/, "شماره تماس باید دقیقاً ۱۱ رقم باشد."],
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "فرمت ایمیل معتبر نیست."],
      sparse: true,
      index: true,
    },

    avatarUrl: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      select: false,
      maxlength: 100,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },

    nationalCode: {
      type: String,
      trim: true,
      maxlength: 10,
      match: [/^$|^\d{10}$/, "کد ملی باید دقیقاً ۱۰ رقم باشد."],
    },

    fatherName: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    role: {
      type: String,
      enum: ["user", "agent", "admin", "superAdmin"],
      default: "user",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
      index: true,
    },

    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    limits: {
      files: {
        type: Number,
        default: 0,
        min: 0,
      },

      blocks: {
        type: Number,
        default: 0,
        min: 0,
      },

      pages: {
        type: Number,
        default: 0,
        min: 0,
      },

    },

    lastLoginAt: {
      type: Date,
    },

    lastOtpRequestAt: {
      type: Date,
    },

    phoneVerifiedAt: {
      type: Date,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agentid: { type: Schema.Types.ObjectId, ref: "Agent" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

UserSchema.index({ agentid: 1, isDeleted: 1 });

UserSchema.index(
  { nationalCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      nationalCode: { $type: "string", $gt: "" },
    },
  },
);


// Useful virtual full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
