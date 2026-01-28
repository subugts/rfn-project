import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const createCustomerSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(2).max(255),
  defaultUnitPrice: z.number().positive(),
  m3Limit: z.number().positive(),
  notes: z.string().optional(),
});

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    await requireRole(UserRole.ACCOUNTING, UserRole.SHIPPING, UserRole.ADMIN);

    const customers = await prisma.customer.findMany({
      where: { active: true },
      include: {
        priceRanges: true,
        contracts: {
          where: { active: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/customers
export async function POST(req: NextRequest) {
  try {
    await requireRole(UserRole.ACCOUNTING, UserRole.ADMIN);

    const body = await req.json();
    const { code, name, defaultUnitPrice, m3Limit, notes } =
      createCustomerSchema.parse(body);

    // Check if code exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { code },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this code already exists' },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        code,
        name,
        defaultUnitPrice,
        m3Limit,
        notes: notes || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
