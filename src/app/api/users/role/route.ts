import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users/role - List all users with their roles (mentor only)
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser || currentUser.role !== 'mentor') {
    return NextResponse.json({ error: 'Only mentors can view users' }, { status: 403 });
  }

  const users = await User.find({}, 'email name role image createdAt').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}

// POST /api/users/role - Change a user's role (mentor only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser || currentUser.role !== 'mentor') {
    return NextResponse.json({ error: 'Only mentors can change roles' }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!email || !['mentor', 'student'].includes(role)) {
    return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
  }

  // Prevent demoting yourself
  if (email === session.user.email && role !== 'mentor') {
    return NextResponse.json({ error: 'You cannot demote yourself' }, { status: 400 });
  }

  const updated = await User.findOneAndUpdate({ email }, { role }, { new: true });
  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: { email: updated.email, role: updated.role } });
}
