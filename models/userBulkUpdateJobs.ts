import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import type { UserBulkUpdatePatch } from "@/lib/users/bulkUpdate";

export type UserBulkUpdateJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface IUserBulkUpdateJob extends Document {
  queueKey: "users";
  requestedBy: Types.ObjectId;
  targetUserIds: Types.ObjectId[];
  updates: UserBulkUpdatePatch;
  status: UserBulkUpdateJobStatus;
  total: number;
  processed: number;
  matched: number;
  modified: number;
  failed: number;
  attempts: number;
  message?: string;
  leaseUntil?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserBulkUpdateJobSchema = new Schema<IUserBulkUpdateJob>(
  {
    queueKey: {
      type: String,
      enum: ["users"],
      default: "users",
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    updates: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      required: true,
      index: true,
    },
    total: { type: Number, required: true, min: 1 },
    processed: { type: Number, default: 0, min: 0 },
    matched: { type: Number, default: 0, min: 0 },
    modified: { type: Number, default: 0, min: 0 },
    failed: { type: Number, default: 0, min: 0 },
    attempts: { type: Number, default: 0, min: 0 },
    message: { type: String, trim: true, maxlength: 500 },
    leaseUntil: { type: Date },
    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true },
);

UserBulkUpdateJobSchema.index({ status: 1, createdAt: 1 });
UserBulkUpdateJobSchema.index({ requestedBy: 1, createdAt: -1 });
UserBulkUpdateJobSchema.index(
  { queueKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "processing" },
  },
);

const UserBulkUpdateJob: Model<IUserBulkUpdateJob> =
  mongoose.models.UserBulkUpdateJob ||
  mongoose.model<IUserBulkUpdateJob>(
    "UserBulkUpdateJob",
    UserBulkUpdateJobSchema,
  );

export default UserBulkUpdateJob;
