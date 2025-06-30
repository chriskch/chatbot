import {
  createOrder,
  getOrderStatus,
  cancelOrder,
  getOrdersByCustomer,
} from "@/lib/functions/oms";

import { prisma } from "@/configs/prisma";

describe("OMS-Funktionen", () => {
  let customer;
  let products;

  beforeAll(async () => {
    customer = await prisma.customer.findUnique({
      where: { email: "besteller@example.com" },
    });

    products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    if (!customer || products.length < 2) {
      throw new Error("Seed data missing. Run `npm run seed:test` first.");
    }
  });

  it("legt eine Bestellung mit Produkten an", async () => {
    const order = await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id, products[1].id],
    });

    expect(order).toMatchObject({
      customer_id: customer.id,
      status: "processing",
    });

    expect(order.order_items.length).toBe(2);
    expect(order.order_items[0]).toHaveProperty("product_id");
    expect(order.order_items[0]).toHaveProperty("price");
  });

  it("liefert Statusinformationen einer Bestellung", async () => {
    const newOrder = await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    const status = await getOrderStatus({ order_id: newOrder.id });

    expect(status).toMatchObject({
      order_id: newOrder.id,
      status: "processing",
    });

    expect(status.items[0].product_id).toBe(products[0].id);
  });

  it("storniert eine Bestellung erfolgreich", async () => {
    const newOrder = await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    const cancelled = await cancelOrder({ order_id: newOrder.id });
    expect(cancelled.status).toBe("cancelled");

    const status = await getOrderStatus({ order_id: newOrder.id });
    expect(status.status).toBe("cancelled");
  });

  it("liefert alle Bestellungen eines Kunden mit Produktdetails", async () => {
    // Lege 2 neue Bestellungen an
    await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    await createOrder({
      customer_id: customer.id,
      product_ids: [products[1].id],
    });

    const orders = await getOrdersByCustomer({ customer_id: customer.id });
    expect(orders.length).toBeGreaterThanOrEqual(2);

    for (const order of orders) {
      for (const item of order.items) {
        expect(item).toHaveProperty("product_name");
        expect(item).toHaveProperty("quantity");
      }
    }
  });
});
