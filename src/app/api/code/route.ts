import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SavedCode from '@/models/SavedCode';

// GET /api/code?batchId=xxx&topicSlug=yyy — get saved code for a topic
export async function GET(req: NextRequest) {
  await connectDB();
  const batchId = req.nextUrl.searchParams.get('batchId') || 'default';
  const topicSlug = req.nextUrl.searchParams.get('topicSlug');

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  const saved = await SavedCode.findOne({ batchId, topicSlug });

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
  await connectDB();
  const { batchId, topicSlug, partSlug, moduleSlug, htmlCode, cssCode, jsCode, tsCode, drawingData } = await req.json();

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  await SavedCode.findOneAndUpdate(
    { batchId: batchId || 'default', topicSlug },
    { partSlug, moduleSlug, htmlCode, cssCode, jsCode, tsCode, drawingData },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
