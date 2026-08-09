import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { signOut } from 'better-auth/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionToken = body.sessionToken;

    await signOut(auth, {
      sessionToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
