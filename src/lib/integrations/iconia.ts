import axios from 'axios';

const iconiaClient = axios.create({
  baseURL: process.env.ICONIA_API_URL || 'http://localhost:3001',
  headers: {
    'Authorization': `Bearer ${process.env.ICONIA_API_KEY}`,
  },
});

export async function sendDeliveryToIconia(deliveryData: {
  deliveryId: string;
  orderNumber: string;
  m3Amount: number;
  customerName: string;
  driverName?: string;
  vehicleId?: string;
}) {
  try {
    const response = await iconiaClient.post('/api/deliveries', {
      docNumber: deliveryData.deliveryId,
      orderRef: deliveryData.orderNumber,
      quantity: deliveryData.m3Amount,
      customerName: deliveryData.customerName,
      driverName: deliveryData.driverName,
      vehicleId: deliveryData.vehicleId,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('Iconia sync failed:', error);
    throw error;
  }
}

export async function getIconiaDeliveryStatus(deliveryId: string) {
  try {
    const response = await iconiaClient.get(`/api/deliveries/${deliveryId}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to get Iconia delivery status:', error);
    throw error;
  }
}

export async function syncIconiaDatabase(sqliteDbPath: string) {
  try {
    // TODO: Implement SQLite sync logic
    // This would read from SQLite and sync with Iconia
    console.log('Syncing with Iconia SQLite:', sqliteDbPath);
  } catch (error) {
    console.error('SQLite sync failed:', error);
    throw error;
  }
}
