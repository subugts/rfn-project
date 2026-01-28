import { NextRequest, NextResponse } from 'next/server';
import { createToken, setAuthCookie } from '@/lib/auth/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['SHIPPING', 'ACCOUNTING', 'OPERATOR']),
});

// Mock users for development (in-memory storage)
let mockUsers: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = mockUsers.find((u) => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const user = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role,
    };

    mockUsers.push(user);

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 });

    await setAuthCookie(token);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
