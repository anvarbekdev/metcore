import { NextRequest, NextResponse } from 'next/server';

const NEST_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  let nestRes: Response;
  try {
    nestRes = await fetch(`${NEST_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: 'Server bilan bog\'lanib bo\'lmadi' }, { status: 503 });
  }

  const data = await nestRes.json();

  if (!nestRes.ok) {
    return NextResponse.json(data, { status: nestRes.status });
  }

  const { user, accessToken, refreshToken } = data;

  const response = NextResponse.json({ user, accessToken });

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}
