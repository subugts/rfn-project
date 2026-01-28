import { NextRequest, NextResponse } from 'next/server';

// Mock orders (development only)
const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2026-001',
    customerId: 'cust-1',
    contractId: 'contract-1',
    customer: {
      id: 'cust-1',
      code: 'CUST001',
      name: 'ABC İnşaat A.Ş.',
    },
    m3Amount: 50,
    unitPrice: 950,
    totalPrice: 47500,
    status: 'PRODUCTION',
    orderDate: new Date('2026-01-25'),
    deliveryDate: new Date('2026-02-05'),
    createdBy: 'accounting-1',
    notes: 'Acil teslimat',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-29'),
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2026-002',
    customerId: 'cust-1',
    contractId: 'contract-2',
    customer: {
      id: 'cust-1',
      code: 'CUST001',
      name: 'ABC İnşaat A.Ş.',
    },
    m3Amount: 80,
    unitPrice: 920,
    totalPrice: 73600,
    status: 'OPEN',
    orderDate: new Date('2026-01-28'),
    deliveryDate: new Date('2026-02-10'),
    createdBy: 'accounting-1',
    notes: null,
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-01-28'),
  },
];

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    let orders = mockOrders;

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      contractId,
      m3Amount,
      unitPrice,
      deliveryDate,
      notes,
    } = body;

    // Mock customers for mapping
    const mockCustomers = [
      { id: 'cust-1', code: 'CUST001', name: 'ABC İnşaat A.Ş.' },
      { id: 'cust-2', code: 'CUST002', name: 'XYZ Yapı Ltd.' },
      { id: 'cust-3', code: 'CUST003', name: 'DEF İnşaat A.Ş.' },
    ];

    const customer = mockCustomers.find((c) => c.id === customerId) || {
      id: customerId,
      code: 'CUST000',
      name: 'Sample Customer',
    };

    const newOrder = {
      id: `order-${mockOrders.length + 1}`,
      orderNumber: `ORD-2026-${String(mockOrders.length + 1).padStart(3, '0')}`,
      customerId,
      contractId: contractId || null,
      customer,
      m3Amount,
      unitPrice,
      totalPrice: m3Amount * unitPrice,
      status: 'OPEN',
      orderDate: new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      createdBy: 'accounting-1',
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrders.push(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
