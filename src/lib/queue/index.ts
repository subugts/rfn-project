import Bull from 'bull';
import { prisma } from '@/lib/db/prisma';

interface QueuePayload {
  orderId?: string;
  type: 'SEND_TO_ICONIA' | 'SEND_TO_MCSOFT' | 'SYNC_DELIVERY' | 'UPDATE_ORDER';
  data: Record<string, any>;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const messageQueue = new Bull('morina-messages', redisUrl);

// Process messages with retry logic
messageQueue.process(async (job) => {
  const { type, data, orderId } = job.data as QueuePayload;

  try {
    // Store in database for tracking
    const queueMessage = await prisma.queueMessage.create({
      data: {
        type,
        payload: JSON.stringify(data),
        status: 'PROCESSING',
        relatedOrderId: orderId,
        attempts: job.attemptsMade + 1,
      },
    });

    // Process based on type
    switch (type) {
      case 'SEND_TO_ICONIA':
        await handleIconiaSync(data, orderId);
        break;
      case 'SEND_TO_MCSOFT':
        await handleMCsoftSync(data, orderId);
        break;
      case 'SYNC_DELIVERY':
        await handleDeliverySync(data, orderId);
        break;
      case 'UPDATE_ORDER':
        await handleOrderUpdate(data, orderId);
        break;
    }

    // Mark as success
    await prisma.queueMessage.update({
      where: { id: queueMessage.id },
      data: {
        status: 'SUCCESS',
        processedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update queue message with error
    if (data.queueMessageId) {
      await prisma.queueMessage.update({
        where: { id: data.queueMessageId },
        data: {
          status: 'FAILED',
          errorMessage,
          lastError: new Date(),
        },
      });
    }

    // Retry logic (Bull handles this automatically)
    throw error;
  }
});

// Handle dead letter (max retries exceeded)
messageQueue.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  
  // Move to dead letter queue
  await prisma.queueMessage.updateMany({
    where: {
      payload: { contains: job.data.data },
    },
    data: {
      status: 'DEAD_LETTER',
      errorMessage: `Max retries exceeded: ${err.message}`,
      failedAt: new Date(),
    },
  });
});

async function handleIconiaSync(data: any, orderId?: string) {
  // TODO: Implement Iconia API call
  console.log('Syncing with Iconia:', data);
  // await sendToIconia(data);
}

async function handleMCsoftSync(data: any, orderId?: string) {
  // TODO: Implement MCsoft API call
  console.log('Syncing with MCsoft:', data);
  // await sendToMCsoft(data);
}

async function handleDeliverySync(data: any, orderId?: string) {
  // TODO: Implement delivery sync
  console.log('Syncing delivery:', data);
}

async function handleOrderUpdate(data: any, orderId?: string) {
  // TODO: Implement order update
  console.log('Updating order:', data);
}

export async function enqueueMessage(payload: QueuePayload) {
  return messageQueue.add(payload, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  });
}
