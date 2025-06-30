import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/configs/prisma";
import { getPaymentStatus, refundPayment } from "@/lib/functions/payment";

describe("Payment-Funktionen", () => {
  let customer;
  let order;

  beforeEach(async () => {
    // Load global test customer
    customer = await prisma.customer.findUnique({
      where: { id: globalThis.testCustomerId },
    });

    // Clean up order & payment data only
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();

    // Create a test order for this customer
    order = await prisma.order.create({
      data: {
        customer_id: customer.id,
        status: "processing",
      },
    });
  });

  it("gibt 'unpaid' zurück, wenn keine Zahlung existiert", async () => {
    const status = await getPaymentStatus({ order_id: order.id });
    expect(status.status).toBe("unpaid");
  });

  it("gibt den Zahlungsstatus zurück, wenn eine Zahlung existiert", async () => {
    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: 49.99,
        status: "paid",
        method: "credit_card",
        paid_at: new Date("2025-05-31T10:00:00Z"),
      },
    });

    const status = await getPaymentStatus({ order_id: order.id });

    expect(status.status).toBe("paid");
    expect(status.method).toBe("credit_card");
    expect(status.amount.toNumber()).toBe(49.99);
    expect(new Date(status.paid_at)).toEqual(new Date("2025-05-31T10:00:00Z"));
    expect(status.refunded_at).toBeNull();
  });

  it("erstattet eine bezahlte Bestellung", async () => {
    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: 100,
        status: "paid",
        method: "paypal",
        paid_at: new Date(),
      },
    });

    const result = await refundPayment({ order_id: order.id });
    expect(result.success).toBe(true);

    const updated = await prisma.payment.findFirst({
      where: { order_id: order.id },
    });
    expect(updated.status).toBe("refunded");
    expect(updated.refunded_at).not.toBeNull();
  });

  it("erstattet nicht, wenn Status nicht 'paid' ist", async () => {
    // ✅ Bestellung vorher anlegen
    const order = await prisma.order.create({
      data: {
        customer_id: globalThis.testCustomerId,
        status: "processing",
      },
    });

    // ❌ Status ist absichtlich nicht 'paid'
    await prisma.payment.create({
      data: {
        order_id: order.id,
        status: "open", // oder "cancelled", etc.
        amount: 42.99,
        method: "paypal",
      },
    });

    const result = await refundPayment({ order_id: order.id });
    expect(result).toEqual({ success: false });

    const updated = await prisma.payment.findFirst({
      where: { order_id: order.id },
    });

    expect(updated.status).toBe("open");
    expect(updated.refunded_at).toBeNull();
  });
});
