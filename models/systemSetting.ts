import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 120,
    },
    value: {
      type: String,
      trim: true,
      default: "",
      maxlength: 256,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const SystemSetting: Model<ISystemSetting> =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);

export default SystemSetting;
