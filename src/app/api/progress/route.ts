import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Progress from '@/models/Progress';

// GET /api/progress?batchId=xxx — get all completed topics for a batch
export async function GET(req: NextRequest) {
  await connectDB();
  const batchId = req.nextUrl.searchParams.get('batchId') || 'default';

  const progress = await Progress.find({ batchId, completed: true }).select('topicSlug -_id');
  const topics = progress.map(p => p.topicSlug);

  return NextResponse.json({ topics });
}

// POST /api/progress — toggle topic completion
export async function POST(req: NextRequest) {
  await connectDB();
  const { batchId, topicSlug, completed } = await req.json();

  if (!topicSlug) {
    return NextResponse.json({ error: 'topicSlug required' }, { status: 400 });
  }

  await Progress.findOneAndUpdate(
    { batchId: batchId || 'default', topicSlug },
    { completed, completedAt: completed ? new Date() : undefined },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
