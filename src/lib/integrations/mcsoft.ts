import axios from 'axios';

const mcsoftClient = axios.create({
  baseURL: process.env.MCSOFT_API_URL || 'http://localhost:3002',
  headers: {
    'Authorization': `Bearer ${process.env.MCSOFT_API_KEY}`,
  },
});

export async function sendOrderToMCsoft(orderData: {
  orderId: string;
  orderNumber: string;
  m3Amount: number;
  customerName: string;
  customerCode: string;
  deliveryDate: string;
  notes?: string;
}) {
  try {
    const response = await mcsoftClient.post('/api/production-orders', {
      jobId: orderData.orderId,
      orderNo: orderData.orderNumber,
      quantity: orderData.m3Amount,
      unit: 'm3',
      customerName: orderData.customerName,
      customerCode: orderData.customerCode,
      dueDate: orderData.deliveryDate,
      notes: orderData.notes,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('MCsoft send failed:', error);
    throw error;
  }
}

export async function getMCsoftProductionStatus(orderId: string) {
  try {
    const response = await mcsoftClient.get(`/api/production-orders/${orderId}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to get MCsoft production status:', error);
    throw error;
  }
}

export async function updateMCsoftProductionPlan(orderId: string, planData: any) {
  try {
    const response = await mcsoftClient.put(
      `/api/production-orders/${orderId}/plan`,
      planData
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update MCsoft production plan:', error);
    throw error;
  }
}

export async function syncMCsoftChanges() {
  try {
    const response = await mcsoftClient.get('/api/production-orders/changes');
    return response.data;
  } catch (error) {
    console.error('Failed to sync MCsoft changes:', error);
    throw error;
  }
}
