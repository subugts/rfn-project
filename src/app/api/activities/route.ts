import { NextRequest, NextResponse } from 'next/server';

interface ActivityLog {
  id: string;
  orderId: string;
  action: 'DELIVERY_SCHEDULED' | 'DELIVERY_UPDATED' | 'DELIVERY_COMPLETED' | 'DELIVERY_DELAYED';
  description: string;
  changes: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

// Mock activity logs
const mockActivityLogs: ActivityLog[] = [
  {
    id: 'activity-1',
    orderId: 'order-1',
    action: 'DELIVERY_SCHEDULED',
    description: 'Sipariş ORD-2026-001 sevkiyata hazırlandı',
    changes: {
      status: 'SCHEDULED',
      scheduledDate: '2026-02-05',
    },
    createdBy: 'shipping-1',
    createdAt: new Date('2026-01-25T10:30:00'),
  },
  {
    id: 'activity-2',
    orderId: 'order-1',
    action: 'DELIVERY_COMPLETED',
    description: 'Sipariş ORD-2026-001 başarıyla teslim edildi',
    changes: {
      status: 'DELIVERED',
      actualDate: '2026-02-05',
      notes: 'Teslim alındı, imza alındı',
    },
    createdBy: 'shipping-1',
    createdAt: new Date('2026-02-05T14:15:00'),
  },
  {
    id: 'activity-3',
    orderId: 'order-2',
    action: 'DELIVERY_SCHEDULED',
    description: 'Sipariş ORD-2026-002 sevkiyata hazırlandı',
    changes: {
      status: 'SCHEDULED',
      scheduledDate: '2026-02-10',
    },
    createdBy: 'shipping-1',
    createdAt: new Date('2026-01-28T09:00:00'),
  },
  {
    id: 'activity-4',
    orderId: 'order-2',
    action: 'DELIVERY_UPDATED',
    description: 'Sipariş ORD-2026-002 durumu güncellendi - Yolda',
    changes: {
      status: 'IN_TRANSIT',
      notes: 'Yolda, müşteri tarafından bekleniyor',
    },
    createdBy: 'shipping-1',
    createdAt: new Date('2026-02-02T11:45:00'),
  },
];

// GET /api/activities
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const action = searchParams.get('action');
    const limit = searchParams.get('limit') || '20';

    let activities = [...mockActivityLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (orderId) {
      activities = activities.filter((a) => a.orderId === orderId);
    }

    if (action) {
      activities = activities.filter((a) => a.action === action);
    }

    return NextResponse.json(activities.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activities
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, description, changes, createdBy } = body;

    const newActivity: ActivityLog = {
      id: `activity-${mockActivityLogs.length + 1}`,
      orderId,
      action,
      description,
      changes,
      createdBy,
      createdAt: new Date(),
    };

    mockActivityLogs.push(newActivity);

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
