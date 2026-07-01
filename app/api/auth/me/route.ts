import { NextRequest, NextResponse } from 'next/server';

const NEST_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let nestRes: Response;
  try {
    nestRes = await fetch(`${NEST_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ message: 'Server bilan bog\'lanib bo\'lmadi' }, { status: 503 });
  }

  if (!nestRes.ok) {
    const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  const user = await nestRes.json();
  // Return token so client can store in-memory for direct NestJS API calls
  return NextResponse.json({ user, accessToken: token });
}
