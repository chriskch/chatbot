import { createOrder, getOrderStatus, cancelOrder, getOrdersByCustomer } from "@/lib/functions/oms";
import { testContext } from "./testContext";
import { describe, it, expect } from "vitest";

describe("OMS Module", () => {
  const customerId = () => testContext.customerId;
  const productIds = () => testContext.productIds;

  it("creates an order with products", async () => {
    const order = await createOrder({
      customer_id: customerId(),
      product_ids: [productIds()[0], productIds()[1]],
    });

    expect(order).toMatchObject({
      customer_id: customerId(),
      status: "processing",
    });

    expect(order.order_items.length).toBe(2);
    expect(order.order_items[0]).toHaveProperty("product_id");
    expect(order.order_items[0]).toHaveProperty("price");
  });

  it("returns status information for an order", async () => {
    const newOrder = await createOrder({
      customer_id: customerId(),
      product_ids: [productIds()[0]],
    });

    const status = await getOrderStatus({ order_id: newOrder.id });

    expect(status).toMatchObject({
      order_id: newOrder.id,
      status: "processing",
    });

    expect(status.items[0].product_id).toBe(productIds()[0]);
  });

  it("successfully cancels an order", async () => {
    const newOrder = await createOrder({
      customer_id: customerId(),
      product_ids: [productIds()[0]],
    });

    const cancelled = await cancelOrder({ order_id: newOrder.id });
    expect(cancelled.status).toBe("cancelled");

    const status = await getOrderStatus({ order_id: newOrder.id });
    expect(status.status).toBe("cancelled");
  });

  it("returns all orders for a customer with product details", async () => {
    // Create 2 new orders
    await createOrder({
      customer_id: customerId(),
      product_ids: [productIds()[0]],
    });

    await createOrder({
      customer_id: customerId(),
      product_ids: [productIds()[1]],
    });

    const orders = await getOrdersByCustomer({ customer_id: customerId() });
    expect(orders.length).toBeGreaterThanOrEqual(2);

    for (const order of orders) {
      expect(order).toHaveProperty("items");
      for (const item of order.items) {
        expect(item).toHaveProperty("product_name");
        expect(item).toHaveProperty("quantity");
      }
    }
  });
});
