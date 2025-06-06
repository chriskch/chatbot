// prisma/seed.js
import { config } from "dotenv";
config({ path: ".env.test" }); // explizit EAM-TEST laden

import { prisma } from "../src/configs/prisma.js";

async function main() {
  const customer = await prisma.customer.upsert({
    where: { email: "besteller@example.com" },
    update: {},
    create: {
      name: "Besteller Bot",
      email: "besteller@example.com",
      phone: "123456789",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Produkt A",
        sku: "SKU123",
        price: 10.99,
        stock: 100,
      },
      {
        name: "Produkt B",
        sku: "SKU456",
        price: 20.49,
        stock: 50,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.product.findMany({
    where: {
      sku: { in: ["SKU123", "SKU456"] },
    },
    orderBy: { sku: "asc" }, // consistent ordering
  });
}

main()
  .then(() => console.log("✅ Test-Seed abgeschlossen"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
