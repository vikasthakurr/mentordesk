import mongoose, { Schema, model, models } from 'mongoose';

export interface IBatch {
  batchId: string;
  name: string;
  createdAt: Date;
}

const BatchSchema = new Schema<IBatch>({
  batchId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { timestamps: true });

export default models.Batch || model<IBatch>('Batch', BatchSchema);
