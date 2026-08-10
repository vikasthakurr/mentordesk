import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Progress from '@/models/Progress';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser || currentUser.role !== 'mentor') {
    return NextResponse.json({ error: 'Mentors only' }, { status: 403 });
  }

  const batchId = req.nextUrl.searchParams.get('batchId');
  if (!batchId) return NextResponse.json({ students: [] });

  // Find all students in this batch
  const students = await User.find({ batchIds: batchId, role: 'student' }).select('name email image').lean();

  // Get progress for each student
  const studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      const completed = await Progress.countDocuments({ userId: student.email, batchId, completed: true });
      return { name: student.name, email: student.email, image: student.image, completedTopics: completed };
    })
  );

  return NextResponse.json({ students: studentsWithProgress });
}
