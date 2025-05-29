import { prisma } from "@/configs/prisma.js";

export async function getProductDetails({ product_id }) {
  const product = await prisma.product.findUnique({
    where: { id: product_id },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    product_id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description || "No description available",
    last_updated: product.createdAt,
  };
}

export async function listProductsByCategory({ category }) {
  const products = await prisma.product.findMany({
    where: {
      category: {
        equals: category,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  return {
    category,
    products,
  };
}
