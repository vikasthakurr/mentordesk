import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Note from '@/models/Note';

// GET /api/notes?topicSlug=xxx — Get note for a topic
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const topicSlug = req.nextUrl.searchParams.get('topicSlug');
  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  await connectDB();
  const note = await Note.findOne({
    userId: session.user.email,
    topicSlug,
  }).lean();

  return NextResponse.json({ content: note?.content || '' });
}

// POST /api/notes — Save note for a topic
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { topicSlug, partSlug, moduleSlug, content } = await req.json();

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  await connectDB();

  await Note.findOneAndUpdate(
    { userId: session.user.email, topicSlug },
    {
      userId: session.user.email,
      topicSlug,
      partSlug: partSlug || '',
      moduleSlug: moduleSlug || '',
      content: content || '',
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
