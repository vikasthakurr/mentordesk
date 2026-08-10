import mongoose, { Schema, model, models } from 'mongoose';

export interface ISavedCode {
  batchId: string;
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  tsCode: string;
  drawingData?: string; // base64 canvas data
}

const SavedCodeSchema = new Schema<ISavedCode>({
  batchId: { type: String, required: true, index: true },
  topicSlug: { type: String, required: true },
  partSlug: { type: String, required: true },
  moduleSlug: { type: String, required: true },
  htmlCode: { type: String, default: '' },
  cssCode: { type: String, default: '' },
  jsCode: { type: String, default: '' },
  tsCode: { type: String, default: '' },
  drawingData: { type: String, default: '' },
}, { timestamps: true });

SavedCodeSchema.index({ batchId: 1, topicSlug: 1 }, { unique: true });

export default models.SavedCode || model<ISavedCode>('SavedCode', SavedCodeSchema);
