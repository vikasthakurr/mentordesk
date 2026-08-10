import mongoose, { Schema, model } from 'mongoose';

export type UserRole = 'mentor' | 'student';

export interface IUser {
  email: string;
  name: string;
  image?: string;
  password?: string;
  role: UserRole;
  batchIds: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  password: { type: String },
  role: { type: String, enum: ['mentor', 'student'], default: 'student' },
  batchIds: { type: [String], default: [] },
}, { timestamps: true });

// Force delete cached model to ensure schema is up to date
const User = mongoose.models.User
  ? mongoose.model<IUser>('User')
  : model<IUser>('User', UserSchema);

export default User;
