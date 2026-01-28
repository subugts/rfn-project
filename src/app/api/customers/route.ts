import { NextRequest, NextResponse } from 'next/server';

// Mock customers (development only)
const mockCustomers = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC İnşaat A.Ş.',
    contactPerson: 'Ahmet Yılmaz',
    billingAddress: 'İstanbul, Bahçelievler Mah. Atatürk Cad. No:123',
    officeAddress: 'İstanbul, Bahçelievler Mah. Atatürk Cad. No:123',
    active: true,
    notes: 'Önemli müşteri',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'XYZ Yapı Ltd.',
    contactPerson: 'Mehmet Şahin',
    billingAddress: 'Ankara, Çankaya Mah. İnönü Cad. No:456',
    officeAddress: 'Ankara, Çankaya Mah. İnönü Cad. No:456',
    active: true,
    notes: 'Regular müşteri',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'cust-3',
    code: 'CUST003',
    name: 'Teknik Gayrimenkul',
    contactPerson: 'Fatma Kaya',
    billingAddress: 'İzmir, Alsancak Mah. Gazi Cad. No:789',
    officeAddress: 'İzmir, Alsancak Mah. Gazi Cad. No:789',
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
    const { code, name, contactPerson, billingAddress, officeAddress, notes } = body;

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
      contactPerson: contactPerson || null,
      billingAddress: billingAddress || null,
      officeAddress: officeAddress || null,
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
