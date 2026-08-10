import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/lib/theme';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/next';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'MentorDesk',
  description: 'An all-in-one mentorship platform for teaching full-stack web development',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className={`${openSans.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
