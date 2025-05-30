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

  beforeEach(async () => {
    customer = await prisma.customer.findUnique({
      where: { id: globalThis.testCustomerId },
    });

    products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    // Nur orders + payments löschen, Customer & Produkte bleiben bestehen
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
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
    const order = await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    const status = await getOrderStatus({ order_id: order.id });

    expect(status).toMatchObject({
      order_id: order.id,
      status: "processing",
    });

    expect(status.items[0].product_id).toBe(products[0].id);
  });

  it("kann eine Bestellung stornieren", async () => {
    const order = await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    const cancelled = await cancelOrder({ order_id: order.id });
    expect(cancelled.status).toBe("cancelled");

    const status = await getOrderStatus({ order_id: order.id });
    expect(status.status).toBe("cancelled");
  });

  it("liefert alle Bestellungen eines Kunden mit Produktdetails", async () => {
    await createOrder({
      customer_id: customer.id,
      product_ids: [products[0].id],
    });

    await createOrder({
      customer_id: customer.id,
      product_ids: [products[1].id],
    });

    const orders = await getOrdersByCustomer({ customer_id: customer.id });
    expect(orders.length).toBe(2);
    expect(orders[0].items[0]).toHaveProperty("product_name");
    expect(orders[0].items[0]).toHaveProperty("quantity");
  });
});
