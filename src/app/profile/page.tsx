import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) redirect('/login');

  const userData = {
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image || null,
    role: dbUser.role,
    batchIds: dbUser.batchIds || [],
    createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
  };

  return <ProfileClient user={userData} />;
}
