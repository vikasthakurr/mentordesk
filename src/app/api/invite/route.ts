import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';

// POST /api/invite - Generate invite link for a batch (mentor only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser || currentUser.role !== 'mentor') {
    return NextResponse.json({ error: 'Only mentors can create invites' }, { status: 403 });
  }

  const { batchId } = await req.json();
  if (!batchId) {
    return NextResponse.json({ error: 'batchId required' }, { status: 400 });
  }

  // Generate a simple invite code (batch ID encoded)
  const inviteCode = Buffer.from(`mentordesk:${batchId}`).toString('base64url');
  return NextResponse.json({ inviteCode, joinUrl: `/join/${inviteCode}` });
}

// GET /api/invite?code=xxx - Join a batch via invite code
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }

  // Decode invite code
  let batchId: string;
  try {
    const decoded = Buffer.from(code, 'base64url').toString();
    if (!decoded.startsWith('mentordesk:')) throw new Error('Invalid');
    batchId = decoded.replace('mentordesk:', '');
  } catch {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
  }

  await connectDB();

  // Add user to batch
  await User.findOneAndUpdate(
    { email: session.user.email },
    { $addToSet: { batchIds: batchId } }
  );

  return NextResponse.json({ success: true, batchId });
}
