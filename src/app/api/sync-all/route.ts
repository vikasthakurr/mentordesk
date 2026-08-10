import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Progress from '@/models/Progress';
import SavedCode from '@/models/SavedCode';
import Batch from '@/models/Batch';

/**
 * POST /api/sync-all
 * Bulk syncs all localStorage data to MongoDB in one request.
 * Body: { batches, progress, code }
 */
export async function POST(req: NextRequest) {
  await connectDB();

  const { batches, progress, code } = await req.json();

  const results = { batches: 0, progress: 0, code: 0 };

  // Sync batches
  if (batches && Array.isArray(batches)) {
    for (const batch of batches) {
      if (batch.id === 'default') continue;
      await Batch.findOneAndUpdate(
        { batchId: batch.id },
        { name: batch.name },
        { upsert: true }
      );
      results.batches++;
    }
  }

  // Sync progress
  if (progress && Array.isArray(progress)) {
    for (const item of progress) {
      await Progress.findOneAndUpdate(
        { batchId: item.batchId, topicSlug: item.topicSlug },
        { completed: true, completedAt: new Date() },
        { upsert: true }
      );
      results.progress++;
    }
  }

  // Sync code
  if (code && Array.isArray(code)) {
    for (const item of code) {
      await SavedCode.findOneAndUpdate(
        { batchId: item.batchId, topicSlug: item.topicSlug },
        {
          partSlug: item.partSlug || '',
          moduleSlug: item.moduleSlug || '',
          htmlCode: item.htmlCode || '',
          cssCode: item.cssCode || '',
          jsCode: item.jsCode || '',
          tsCode: item.tsCode || '',
          drawingData: item.drawingData || '',
        },
        { upsert: true }
      );
      results.code++;
    }
  }

  return NextResponse.json({ success: true, synced: results });
}
