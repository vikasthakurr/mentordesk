import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Batch from '@/models/Batch';

// GET /api/batches — get all batches
export async function GET() {
  await connectDB();
  const batches = await Batch.find().sort({ createdAt: 1 });

  if (batches.length === 0) {
    return NextResponse.json({ batches: [{ batchId: 'default', name: 'Default', createdAt: new Date(0) }] });
  }

  return NextResponse.json({ batches });
}

// POST /api/batches — create a new batch
export async function POST(req: NextRequest) {
  await connectDB();
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const batchId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existing = await Batch.findOne({ batchId });
  if (existing) {
    return NextResponse.json({ error: 'Batch already exists' }, { status: 409 });
  }

  const batch = await Batch.create({ batchId, name: name.trim() });
  return NextResponse.json({ batch }, { status: 201 });
}

// DELETE /api/batches?batchId=xxx — delete a batch
export async function DELETE(req: NextRequest) {
  await connectDB();
  const batchId = req.nextUrl.searchParams.get('batchId');

  if (!batchId || batchId === 'default') {
    return NextResponse.json({ error: 'Cannot delete default batch' }, { status: 400 });
  }

  await Batch.deleteOne({ batchId });
  return NextResponse.json({ success: true });
}
