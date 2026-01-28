import { NextRequest, NextResponse } from 'next/server';

// Mock users (development only)
const mockUsers = [
  {
    id: 'admin-1',
    email: 'admin@morina.com',
    password: 'Admin123!',
    name: 'Sistem Yöneticisi',
    role: 'ADMIN',
  },
  {
    id: 'shipping-1',
    email: 'shipping@morina.com',
    password: 'Shipping123!',
    name: 'Sevkiyatçı',
    role: 'SHIPPING',
  },
  {
    id: 'accounting-1',
    email: 'accounting@morina.com',
    password: 'Accounting123!',
    name: 'Muhasebe Müdürü',
    role: 'ACCOUNTING',
  },
  {
    id: 'operator-1',
    email: 'operator@morina.com',
    password: 'Operator123!',
    name: 'Santral Operatörü',
    role: 'OPERATOR',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Find user in mock data
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a simple token (base64 encoded)
    const token = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email, role: user.role })
    ).toString('base64');

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
