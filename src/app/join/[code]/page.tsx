import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  const session = await auth();

  if (!session) redirect('/login');

  // Decode invite
  let batchId: string;
  try {
    const decoded = Buffer.from(code, 'base64url').toString();
    if (!decoded.startsWith('mentordesk:')) throw new Error('Invalid');
    batchId = decoded.replace('mentordesk:', '');
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Invite</h1>
          <p className="text-gray-500 mt-2">This invite link is not valid.</p>
        </div>
      </div>
    );
  }

  // Add user to batch
  await connectDB();
  await User.findOneAndUpdate(
    { email: session.user?.email },
    { $addToSet: { batchIds: batchId } }
  );

  redirect('/');
}
