import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const { connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return null;
        if (!user.password) return null;

        const bcrypt = (await import('bcryptjs')).default;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image || null,
        };
      },
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
