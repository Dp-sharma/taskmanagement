import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const authCookie = cookies().get('team_auth');
  if (authCookie) {
    return NextResponse.json({ user: authCookie.value });
  }
  return NextResponse.json({ user: null }, { status: 401 });
}