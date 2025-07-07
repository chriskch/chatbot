import { prisma } from "../../src/configs/prisma";
import { testContext } from "./testContext";
import { beforeAll, beforeEach, afterEach } from "vitest";

beforeAll(async () => {
  const customer = await prisma.customer.findUnique({
    where: { email: "kunde@example.com" },
  });

  if (!customer) {
    throw new Error("❌ Kunde aus Seed nicht gefunden. Seed ausführen!");
  }

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  if (products.length === 0) {
    throw new Error("❌ Produkte aus Seed nicht gefunden. Seed ausführen!");
  }

  testContext.customerId = customer.id;
  testContext.productIds = products.map((p) => p.id);

  console.log(`✅ Seed-Daten erfolgreich geladen! User ID: ${customer.id}`);
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe(`BEGIN`);
});

afterEach(async () => {
  await prisma.$executeRawUnsafe(`ROLLBACK`);
});
