import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const teamMembers = JSON.parse(process.env.TEAM_MEMBERS_JSON || '{}');
    const correctPassword = teamMembers[username];

    if (correctPassword && correctPassword === password) {
      // Set a secure, HTTP-only cookie with the username
      cookies().set('team_auth', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return NextResponse.json({ success: true, user: username });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }
}