import { Schema, model, models } from 'mongoose';

export type UserRole = 'mentor' | 'student';

export interface IUser {
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  batchIds: string[]; // batches this user belongs to
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  role: { type: String, enum: ['mentor', 'student'], default: 'student' },
  batchIds: { type: [String], default: [] },
}, { timestamps: true });

export default models.User || model<IUser>('User', UserSchema);
