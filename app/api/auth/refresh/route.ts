import { NextRequest, NextResponse } from 'next/server';

const NEST_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  let nestRes: Response;
  try {
    nestRes = await fetch(`${NEST_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json({ message: 'Server bilan bog\'lanib bo\'lmadi' }, { status: 503 });
  }

  if (!nestRes.ok) {
    const response = NextResponse.json({ message: 'Token yangilash muvaffaqiyatsiz' }, { status: 401 });
    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  const data = await nestRes.json();
  const { accessToken, refreshToken: newRefreshToken } = data;

  const response = NextResponse.json({ accessToken });

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  if (newRefreshToken) {
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}
