import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Progress from '@/models/Progress';

// GET /api/dashboard/export?batchId=xxx — Export batch progress as CSV
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser || currentUser.role !== 'mentor') {
    return NextResponse.json({ error: 'Mentors only' }, { status: 403 });
  }

  const batchId = req.nextUrl.searchParams.get('batchId');
  if (!batchId) {
    return NextResponse.json({ error: 'batchId required' }, { status: 400 });
  }

  // Find all students in this batch
  const students = await User.find({ batchIds: batchId, role: 'student' })
    .select('name email')
    .lean();

  // Get progress for each student
  const rows: string[] = ['Name,Email,Topics Completed,Last Activity'];

  for (const student of students) {
    const completedCount = await Progress.countDocuments({
      userId: student.email,
      batchId,
      completed: true,
    });

    const lastProgress = await Progress.findOne({
      userId: student.email,
      batchId,
      completed: true,
    })
      .sort({ completedAt: -1 })
      .select('completedAt')
      .lean();

    const lastActivity = lastProgress?.completedAt
      ? new Date(lastProgress.completedAt).toISOString().split('T')[0]
      : 'N/A';

    // Escape CSV fields
    const name = student.name.includes(',') ? `"${student.name}"` : student.name;
    rows.push(`${name},${student.email},${completedCount},${lastActivity}`);
  }

  const csv = rows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="batch-${batchId}-progress.csv"`,
    },
  });
}
