import { prisma } from "@/configs/prisma.js";

export async function createOrder({ customer_id, product_ids }) {
  // Optional: Hole Produktdaten (z. B. für Preis)
  const products = await prisma.product.findMany({
    where: { id: { in: product_ids } },
  });

  const items = products.map((product) => ({
    productId: product.id,
    quantity: 1, // oder aus Parameter übergeben
    price: product.price,
  }));

  const order = await prisma.order.create({
    data: {
      customerId: customer_id,
      status: "processing",
      items: {
        create: items,
      },
    },
    include: {
      items: true,
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

  const uniqueProductIds = [...new Set(allProductIds)];

  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
    },
  });

  const productMap = Object.fromEntries(
    products.map((product) => [product.id, product])
  );

  return orders.map((order) => ({
    order_id: order.id,
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
