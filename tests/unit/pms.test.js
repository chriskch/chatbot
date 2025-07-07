import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/configs/prisma";
import { getProductDetails } from "@/lib/functions/pms";
import { testContext } from "./testContext";

describe("PMS Module", () => {
  let products;

  beforeEach(async () => {
    // Lade die globalen Produkte aus dem testContext
    products = await prisma.product.findMany({
      where: { id: { in: testContext.productIds } },
      orderBy: { id: "asc" },
    });

    if (products.length === 0) {
      throw new Error("❌ Seed data missing. Run `npm run seed` first.");
    }
  });

  it("returns details for a product", async () => {
    const result = await getProductDetails({ product_id: products[0].id });

    expect(result).toMatchObject({
      product_id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      stock: products[0].stock,
    });
  });

  it("throws an error if product does not exist", async () => {
    await expect(getProductDetails({ product_id: 9999 })).rejects.toThrow("Product not found");
  });
});
