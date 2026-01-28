import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/permissions';
import { enqueueMessage } from '@/lib/queue';
import { OrderStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string(),
  m3Amount: z.number().positive(),
  unitPrice: z.number().positive(),
  deliveryDate: z.string().datetime().optional(),
  contractId: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(UserRole.SHIPPING, UserRole.ACCOUNTING, UserRole.ADMIN);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status: status as OrderStatus }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: true,
        contract: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(UserRole.ACCOUNTING, UserRole.ADMIN);

    const body = await req.json();
    const {
      customerId,
      m3Amount,
      unitPrice,
      deliveryDate,
      contractId,
      notes,
    } = createOrderSchema.parse(body);

    // Generate order number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderDate: 'desc' },
      select: { orderNumber: true },
    });

    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        m3Amount,
        unitPrice,
        totalPrice: m3Amount * unitPrice,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        contractId: contractId || null,
        notes,
        createdBy: session.userId as string,
        status: 'OPEN',
      },
      include: {
        customer: true,
        contract: true,
      },
    });

    // Create production plan
    await prisma.productionPlan.create({
      data: {
        orderId: order.id,
        m3Planned: m3Amount,
      },
    });

    // Enqueue message for external systems
    await enqueueMessage({
      orderId: order.id,
      type: 'SEND_TO_MCSOFT',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        m3Amount,
        customerName: order.customer.name,
        customerCode: order.customer.code,
        deliveryDate: order.deliveryDate?.toISOString(),
        notes,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
