import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();

  console.log('Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const shippingPassword = await bcrypt.hash('Shipping123!', 10);
  const accountingPassword = await bcrypt.hash('Accounting123!', 10);
  const operatorPassword = await bcrypt.hash('Operator123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@morina.com',
      name: 'Sistem Yöneticisi',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const shipping = await prisma.user.create({
    data: {
      email: 'shipping@morina.com',
      name: 'Sevkiyatçı',
      password: shippingPassword,
      role: 'SHIPPING',
    },
  });

  const accounting = await prisma.user.create({
    data: {
      email: 'accounting@morina.com',
      name: 'Muhasebe Müdürü',
      password: accountingPassword,
      role: 'ACCOUNTING',
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: 'operator@morina.com',
      name: 'Santral Operatörü',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });

  console.log('Users created:', { admin, shipping, accounting, operator });

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      code: 'CUST001',
      name: 'ABC İnşaat A.Ş.',
      defaultUnitPrice: 150,
      m3Limit: 1000,
      notes: 'Önemli müşteri',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      code: 'CUST002',
      name: 'XYZ Yapı Ltd.',
      defaultUnitPrice: 160,
      m3Limit: 500,
      notes: 'Regular müşteri',
    },
  });

  console.log('Customers created:', { customer1, customer2 });

  // Create price ranges for customer1
  await prisma.customerPriceRange.create({
    data: {
      customerId: customer1.id,
      m3From: 0,
      m3To: 100,
      unitPrice: 150,
    },
  });

  await prisma.customerPriceRange.create({
    data: {
      customerId: customer1.id,
      m3From: 101,
      m3To: 500,
      unitPrice: 145,
    },
  });

  await prisma.customerPriceRange.create({
    data: {
      customerId: customer1.id,
      m3From: 501,
      unitPrice: 140,
    },
  });

  console.log('Price ranges created');

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
