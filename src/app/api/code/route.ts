import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import SavedCode from '@/models/SavedCode';

// GET /api/code?batchId=xxx&topicSlug=yyy — get saved code for a topic
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const batchId = req.nextUrl.searchParams.get('batchId') || 'default';
  const topicSlug = req.nextUrl.searchParams.get('topicSlug');
  const userId = session.user.email;

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  const saved = await SavedCode.findOne({ userId, batchId, topicSlug });

  if (!saved) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    htmlCode: saved.htmlCode,
    cssCode: saved.cssCode,
    jsCode: saved.jsCode,
    tsCode: saved.tsCode,
    drawingData: saved.drawingData,
  });
}

// POST /api/code — save code for a topic
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { batchId, topicSlug, partSlug, moduleSlug, htmlCode, cssCode, jsCode, tsCode, drawingData } = await req.json();
  const userId = session.user.email;

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  await SavedCode.findOneAndUpdate(
    { userId, batchId: batchId || 'default', topicSlug },
    { partSlug, moduleSlug, htmlCode, cssCode, jsCode, tsCode, drawingData },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
