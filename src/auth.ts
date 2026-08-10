import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        await connectDB();
        const email = user.email || '';
        const existing = await User.findOne({ email });
        if (!existing) {
          const role = email === 'vikasthakur.main@gmail.com' ? 'mentor' : 'student';
          await User.create({
            email,
            name: user.name || 'User',
            image: user.image || '',
            role,
            batchIds: [],
          });
        } else if (email === 'vikasthakur.main@gmail.com' && existing.role !== 'mentor') {
          await User.findOneAndUpdate({ email }, { role: 'mentor' });
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const { connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).batchIds = dbUser.batchIds;
          (session.user as any).id = dbUser._id.toString();
        }
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
