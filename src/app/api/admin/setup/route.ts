import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/setup - One-time setup to make vikasthakur.main@gmail.com a mentor
export async function GET() {
  await connectDB();

  const result = await User.findOneAndUpdate(
    { email: 'vikasthakur.main@gmail.com' },
    { role: 'mentor' },
    { new: true }
  );

  if (result) {
    return NextResponse.json({ success: true, message: 'Role updated to mentor', user: result.email });
  }

  return NextResponse.json({ success: false, message: 'User not found. Sign in with Google first.' });
}
