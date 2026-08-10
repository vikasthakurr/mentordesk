'use client';

import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';

export default function AuthHeader() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return <UserMenu user={session.user as any} />;
}
