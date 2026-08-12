import mongoose, { Schema, model, models } from 'mongoose';

export interface INote {
  userId: string;
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  content: string;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  userId: { type: String, required: true },
  topicSlug: { type: String, required: true },
  partSlug: { type: String, required: true },
  moduleSlug: { type: String, required: true },
  content: { type: String, default: '' },
}, { timestamps: true });

NoteSchema.index({ userId: 1, topicSlug: 1 }, { unique: true });

export default models.Note || model<INote>('Note', NoteSchema);
