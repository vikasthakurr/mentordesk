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
    async signIn({ user }) {
      // Dynamically import to avoid Edge Runtime issues
      const { connectDB } = await import('@/lib/mongodb');
      const { default: User } = await import('@/models/User');
      await connectDB();
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        await User.create({
          email: user.email,
          name: user.name,
          image: user.image,
          role: 'student',
          batchIds: [],
        });
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
  pages: {
    signIn: '/login',
  },
});
