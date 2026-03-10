import mongoose, { Schema, Document } from "mongoose";

export interface IStaffLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetModel?: string;
  targetId?: mongoose.Types.ObjectId;
  details?: string;
  createdAt: Date;
}

const staffLogSchema = new Schema<IStaffLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetModel: { type: String },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Index for faster queries
staffLogSchema.index({ createdAt: -1 });

export default mongoose.model<IStaffLog>("StaffLog", staffLogSchema);
