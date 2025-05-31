import { prisma } from "@/configs/prisma.js";

export async function createOrder({ customer_id, product_ids }) {
  const products = await prisma.product.findMany({
    where: { id: { in: product_ids } },
  });

  const items = products.map((product) => ({
    product_id: product.id,
    quantity: 1,
    price: product.price,
  }));

  const lastOrder = await prisma.order.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const nextOrderId = (lastOrder?.id || 0) + 1;
  const orderNumber = `OR${nextOrderId.toString().padStart(3, "0")}`;
  const trackingNumber = `T${Math.floor(100000 + Math.random() * 900000)}`;

  console.log("Creating order:", {
    customer_id,
    orderNumber,
    trackingNumber,
  });

  const order = await prisma.order.create({
    data: {
      customer_id,
      order_number: orderNumber,
      tracking_number: trackingNumber,
      status: "processing",
      order_items: {
        create: items,
      },
    },
    include: {
      order_items: true,
    },
  });

  return order;
}

export async function getOrderStatus({ order_id }) {
  const order = await prisma.order.findUnique({
    where: { id: order_id },
    include: {
      order_items: true,
      customers: true,
    },
  });

  if (!order) throw new Error("Order not found");

  return {
    order_id: order.id,
    order_number: order.order_number,
    tracking_number: order.tracking_number,
    status: order.status,
    customer: order.customers?.name || null,
    items: order.order_items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    })),
    created_at: order.createdAt,
  };
}

export async function cancelOrder({ order_id }) {
  const order = await prisma.order.update({
    where: { id: order_id },
    data: { status: "cancelled" },
  });

  return {
    order_id: order.id,
    status: order.status,
  };
}

export async function getOrdersByCustomer({ customer_id }) {
  const orders = await prisma.order.findMany({
    where: { customer_id },
    include: {
      order_items: true,
    },
  });

  const allProductIds = orders.flatMap((order) =>
    order.order_items.map((item) => item.product_id)
  );

  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds } },
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return orders.map((order) => ({
    order_id: order.id,
    order_number: order.order_number,
    tracking_number: order.tracking_number,
    status: order.status,
    items: order.order_items.map((item) => ({
      product_id: item.product_id,
      product_name: productMap[item.product_id]?.name || null,
      quantity: item.quantity,
      price: item.price,
    })),
    created_at: order.createdAt,
  }));
}

export async function getOrderByNumber({ order_number }) {
  const order = await prisma.order.findUnique({
    where: { order_number },
    include: {
      order_items: true,
      customers: true,
    },
  });

  if (!order) throw new Error("Order not found");

  return {
    order_id: order.id,
    order_number: order.order_number,
    tracking_number: order.tracking_number,
    status: order.status,
    customer: order.customers?.name || null,
    items: order.order_items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    })),
    created_at: order.createdAt,
  };
}
