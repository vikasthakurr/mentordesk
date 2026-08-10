import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

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

  await User.findOneAndUpdate({ email }, { role });
  return NextResponse.json({ success: true });
}
