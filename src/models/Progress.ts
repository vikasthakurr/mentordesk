import mongoose, { Schema, model, models } from 'mongoose';

export interface IProgress {
  userId: string;
  batchId: string;
  topicSlug: string;
  completed: boolean;
  completedAt?: Date;
}

const ProgressSchema = new Schema<IProgress>({
  userId: { type: String, required: true },
  batchId: { type: String, required: true },
  topicSlug: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

// Compound index for fast lookups
ProgressSchema.index({ userId: 1, batchId: 1, topicSlug: 1 }, { unique: true });

export default models.Progress || model<IProgress>('Progress', ProgressSchema);
