import { prisma } from "@/configs/prisma";

export async function getPaymentStatus({ order_id }) {
  const payment = await prisma.payment.findFirst({
    where: { order_id },
  });

  if (!payment) return { status: "unpaid" };

  return {
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    paid_at: payment.paid_at,
    refunded_at: payment.refunded_at,
  };
}

export async function refundPayment({ order_id }) {
  const payment = await prisma.payment.updateMany({
    where: { order_id, status: "paid" },
    data: {
      status: "refunded",
      refundedAt: new Date(),
    },
  });

  return { success: payment.count > 0 };
}
