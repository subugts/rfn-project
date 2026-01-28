import { NextRequest, NextResponse } from 'next/server';

// Mock customers (development only)
const mockCustomers = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC İnşaat A.Ş.',
    active: true,
    notes: 'Önemli müşteri',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'XYZ Yapı Ltd.',
    active: true,
    notes: 'Regular müşteri',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-3',
    code: 'CUST003',
    name: 'Teknik Gayrimenkul',
    active: true,
    notes: null,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-29'),
  },
];

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(mockCustomers);
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, notes } = body;

    // Check if code exists
    const existingCustomer = mockCustomers.find((c) => c.code === code);
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this code already exists' },
        { status: 409 }
      );
    }

    const newCustomer = {
      id: `cust-${mockCustomers.length + 1}`,
      code,
      name,
      active: true,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomers.push(newCustomer);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
