import { NextRequest, NextResponse } from 'next/server';

interface DeliveryLog {
  id: string;
  orderId: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
  scheduledDate: Date;
  actualDate: Date | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock delivery logs
const mockDeliveries: DeliveryLog[] = [
  {
    id: 'delivery-1',
    orderId: 'order-1',
    status: 'DELIVERED',
    scheduledDate: new Date('2026-02-05'),
    actualDate: new Date('2026-02-05'),
    notes: 'Teslim alındı, imza alındı',
    createdBy: 'shipping-1',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'delivery-2',
    orderId: 'order-2',
    status: 'IN_TRANSIT',
    scheduledDate: new Date('2026-02-10'),
    actualDate: null,
    notes: 'Yolda, müşteri tarafından bekleniyor',
    createdBy: 'shipping-1',
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-02'),
  },
];

// GET /api/deliveries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');

    let deliveries = mockDeliveries;

    if (orderId) {
      deliveries = deliveries.filter((d) => d.orderId === orderId);
    }

    if (status) {
      deliveries = deliveries.filter((d) => d.status === status);
    }

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/deliveries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, scheduledDate, actualDate, notes } = body;

    const newDelivery: DeliveryLog = {
      id: `delivery-${mockDeliveries.length + 1}`,
      orderId,
      status,
      scheduledDate: new Date(scheduledDate),
      actualDate: actualDate ? new Date(actualDate) : null,
      notes: notes || null,
      createdBy: 'shipping-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDeliveries.push(newDelivery);

    return NextResponse.json(newDelivery, { status: 201 });
  } catch (error) {
    console.error('Create delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/deliveries/:id
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryId = searchParams.get('id');
    const body = await req.json();
    const { status, actualDate, notes } = body;

    const delivery = mockDeliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    if (status) delivery.status = status;
    if (actualDate) delivery.actualDate = new Date(actualDate);
    if (notes !== undefined) delivery.notes = notes;
    delivery.updatedAt = new Date();

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Update delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
