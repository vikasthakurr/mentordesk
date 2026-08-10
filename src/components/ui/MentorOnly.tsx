'use client';
import { useSession } from 'next-auth/react';

export default function MentorOnly({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  if ((session?.user as any)?.role !== 'mentor') return null;
  return <>{children}</>;
}
