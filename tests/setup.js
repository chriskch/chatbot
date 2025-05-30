import { prisma } from "../src/configs/prisma";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  await prisma.supportTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  const customer = await prisma.customer.create({
    data: {
      name: "Besteller Bot",
      email: "besteller@example.com",
      phone: "123456789",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: "Produkt A",
      sku: "SKU123",
      price: 10.99,
      stock: 100,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Produkt B",
      sku: "SKU456",
      price: 20.49,
      stock: 50,
    },
  });

  globalThis.testCustomerId = customer.id;
  globalThis.testProductIds = [product1.id, product2.id];
});

afterAll(async () => {
  await prisma.$disconnect();
});
