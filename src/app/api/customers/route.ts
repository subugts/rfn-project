import { NextRequest, NextResponse } from 'next/server';

// Mock customers (development only)
const mockCustomers = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC İnşaat A.Ş.',
    m3Limit: 1000,
    currentM3Used: 350,
    active: true,
    notes: 'Önemli müşteri',
    priceRanges: [
      { minM3: 0, maxM3: 120, unitPrice: 1000 },
      { minM3: 120, maxM3: 500, unitPrice: 950 },
      { minM3: 500, maxM3: 1000, unitPrice: 900 },
    ],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'XYZ Yapı Ltd.',
    m3Limit: 500,
    currentM3Used: 150,
    active: true,
    notes: 'Regular müşteri',
    priceRanges: [
      { minM3: 0, maxM3: 100, unitPrice: 1100 },
      { minM3: 100, maxM3: 500, unitPrice: 1050 },
    ],
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-3',
    code: 'CUST003',
    name: 'Teknik Gayrimenkul',
    m3Limit: 800,
    currentM3Used: 200,
    active: true,
    notes: null,
    priceRanges: [
      { minM3: 0, maxM3: 150, unitPrice: 1050 },
      { minM3: 150, maxM3: 800, unitPrice: 1000 },
    ],
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
    const { code, name, m3Limit, priceRanges, notes } = body;

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
      m3Limit,
      currentM3Used: 0,
      active: true,
      priceRanges: priceRanges || [
        { minM3: 0, maxM3: m3Limit, unitPrice: 1000 },
      ],
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
