import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// GET — get last visited topic
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ topic: null });
  
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  return NextResponse.json({ topic: (user as any)?.lastVisited || null });
}

// POST — save last visited topic
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { topicPath } = await req.json();
  await connectDB();
  await User.findOneAndUpdate({ email: session.user.email }, { lastVisited: topicPath });
  return NextResponse.json({ success: true });
}
