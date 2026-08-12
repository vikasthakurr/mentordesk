import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import mongoose, { Schema, model, models } from 'mongoose';
import SharedCodeViewer from './SharedCodeViewer';

interface ISharedCode {
  shareId: string;
  title: string;
  code: string;
  language: string;
}

const SharedCodeSchema = new Schema<ISharedCode>({
  shareId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
}, { timestamps: true });

const SharedCode = models.SharedCode || model<ISharedCode>('SharedCode', SharedCodeSchema);

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params;
  await connectDB();
  const snippet = await SharedCode.findOne({ shareId: id }).lean();
  return {
    title: snippet ? `${snippet.title} | MentorDesk Share` : 'Shared Code | MentorDesk',
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  await connectDB();
  const snippet = await SharedCode.findOne({ shareId: id }).lean();

  if (!snippet) {
    notFound();
  }

  return (
    <SharedCodeViewer
      title={snippet.title}
      code={snippet.code}
      language={snippet.language}
      shareId={id}
    />
  );
}
