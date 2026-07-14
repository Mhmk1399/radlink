import mongoose, { Schema } from "mongoose";

export type BookingStatus = "new" | "confirmed" | "cancelled" | "done";

const bookingCustomFieldSchema = new Schema(
  {
    key: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    value: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    page: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },
    pageOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
      index: true,
    },
    blockInstanceId: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    selectedDate: {
      type: String,
      trim: true,
    },
    selectedTime: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    customFields: {
      type: [bookingCustomFieldSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "confirmed", "cancelled", "done"],
      default: "new",
      index: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    ip: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

bookingSchema.index({ pageOwner: 1, createdAt: -1 });
bookingSchema.index({ assignedUser: 1, createdAt: -1 });
bookingSchema.index({ agent: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ page: 1, createdAt: -1 });

const Booking: mongoose.Model<any> =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
