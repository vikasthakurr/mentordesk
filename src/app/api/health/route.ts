import { NextResponse } from 'next/server';

// Health check endpoint - pinged by Vercel cron to keep functions warm
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
