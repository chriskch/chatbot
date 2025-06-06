import { prisma } from "../src/configs/prisma";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

beforeAll(async () => {
  // Hole IDs aus der bereits gesäten Datenbank
  const customer = await prisma.customer.findUnique({
    where: { email: "besteller@example.com" },
  });

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  globalThis.testCustomerId = customer.id;
  globalThis.testProductIds = products.map((p) => p.id);
});

beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
