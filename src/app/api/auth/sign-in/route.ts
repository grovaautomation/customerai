import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { signInWithCredentials } from 'better-auth/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in using better-auth
    const session = await signInWithCredentials(auth, {
      email,
      password,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Sign in error:', error);

    if (error.message?.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
