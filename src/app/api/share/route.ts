import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';

// Simple shared code snippets model
interface ISharedCode {
  shareId: string;
  title: string;
  code: string;
  language: string;
  createdBy?: string;
  createdAt: Date;
}

const SharedCodeSchema = new Schema<ISharedCode>({
  shareId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  createdBy: { type: String },
}, { timestamps: true });

// TTL index: auto-delete after 7 days
SharedCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const SharedCode = models.SharedCode || model<ISharedCode>('SharedCode', SharedCodeSchema);

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// POST /api/share — Create a shared code snippet
export async function POST(req: NextRequest) {
  const { title, code, language, createdBy } = await req.json();

  if (!code || !code.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  await connectDB();

  const shareId = generateId();
  await SharedCode.create({
    shareId,
    title: title || 'Untitled',
    code,
    language: language || 'javascript',
    createdBy: createdBy || undefined,
  });

  return NextResponse.json({ shareId, url: `/share/${shareId}` });
}

// GET /api/share?id=xxx — Get a shared snippet
export async function GET(req: NextRequest) {
  const shareId = req.nextUrl.searchParams.get('id');
  if (!shareId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await connectDB();
  const snippet = await SharedCode.findOne({ shareId }).lean();

  if (!snippet) {
    return NextResponse.json({ error: 'Snippet not found or expired' }, { status: 404 });
  }

  return NextResponse.json({
    shareId: snippet.shareId,
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
  });
}
