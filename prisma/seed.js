// prisma/seed.js
import { config } from "dotenv";
config({ path: ".env.test" });

import { prisma } from "../src/configs/prisma.js";

async function main() {
  // 🔸 Kunden erstellen
  const customer = await prisma.customer.upsert({
    where: { email: "kunde@example.com" },
    update: {},
    create: {
      name: "Max Mustermann",
      email: "kunde@example.com",
      phone: "+491234567890",
    },
  });

  // 🔸 Support-Tickets für den Kunden
  await prisma.supportTicket.createMany({
    data: [
      {
        customer_id: customer.id,
        ticket_number: "T001",
        subject: "Probleme mit der Bestellung",
        status: "open",
      },
      {
        customer_id: customer.id,
        ticket_number: "T002",
        subject: "Produkt defekt",
        status: "closed",
      },
    ],
    skipDuplicates: true,
  });

  // 🔸 Produkte erstellen
  await prisma.product.createMany({
    data: [
      {
        name: "Espressomaschine",
        sku: "ESPR-001",
        price: 199.99,
        stock: 10,
        category: "Küche",
      },
      {
        name: "Bluetooth Lautsprecher",
        sku: "BTSP-002",
        price: 59.99,
        stock: 30,
        category: "Elektronik",
      },
    ],
    skipDuplicates: true,
  });

  const products = await prisma.product.findMany({
    where: { sku: { in: ["ESPR-001", "BTSP-002"] } },
    orderBy: { sku: "asc" },
  });

  // 🔸 Bestellung für den Kunden erstellen
  const order = await prisma.order.create({
    data: {
      customer_id: customer.id,
      order_number: "OR123",
      tracking_number: "TRK987654",
      status: "shipped",
      order_items: {
        create: [
          {
            product_id: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
          {
            product_id: products[1].id,
            quantity: 2,
            price: products[1].price,
          },
        ],
      },
    },
    include: { order_items: true },
  });

  // 🔸 Zahlung für die Bestellung
  await prisma.payment.create({
    data: {
      order_id: order.id,
      amount: order.order_items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
      status: "paid",
      method: "credit_card",
      paid_at: new Date(),
    },
  });

  console.log("✅ Test-Seed abgeschlossen");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
