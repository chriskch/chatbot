import { describe, it, expect } from "vitest";
import { prisma } from "@/configs/prisma";
import { getPaymentStatus, refundPayment } from "@/lib/functions/payment";
import { testContext } from "./testContext";

describe("Payment Module", () => {
  const customerId = () => testContext.customerId;
  let order;

  beforeEach(async () => {
    // Lege eine Testbestellung für den Kunden an
    order = await prisma.order.create({
      data: {
        customer_id: customerId(),
        status: "processing",
      },
    });
  });

  it("returns 'unpaid' if no payment exists", async () => {
    const status = await getPaymentStatus({ order_id: order.id });
    expect(status.status).toBe("unpaid");
  });

  it("returns the payment status when a payment exists", async () => {
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

  it("refunds a paid order", async () => {
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

  it("does not refund if payment is not 'paid'", async () => {
    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: 42.99,
        status: "open", // intentionally not 'paid'
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
