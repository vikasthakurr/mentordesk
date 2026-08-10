import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  await connectDB();

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'student',
    batchIds: [],
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
