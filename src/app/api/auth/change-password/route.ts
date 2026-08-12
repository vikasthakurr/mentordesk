import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/auth/change-password — Change password for the current user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 attempts per user per minute
  const { allowed } = checkRateLimit(`change-pw:${session.user.email}`, { max: 5, windowSeconds: 60 });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'New password must be at least 6 characters' },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // If user has a password (credentials account), verify current password
  if (user.password) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }
  }

  // Hash and save new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.findOneAndUpdate(
    { email: session.user.email },
    { password: hashedPassword }
  );

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
}
