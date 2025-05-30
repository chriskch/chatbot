import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/configs/prisma";
import { getProductDetails } from "@/lib/functions/pms";

describe("PMS-Funktionen", () => {
  let products;

  beforeEach(async () => {
    // use globally seeded products
    products = await prisma.product.findMany({
      where: { id: { in: globalThis.testProductIds } },
      orderBy: { id: "asc" },
    });
  });

  it("liefert Details zu einem Produkt", async () => {
    const result = await getProductDetails({ product_id: products[0].id });

    expect(result).toMatchObject({
      product_id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      stock: products[0].stock,
    });
  });

  it("wirft Fehler, wenn Produkt nicht existiert", async () => {
    await expect(getProductDetails({ product_id: 9999 })).rejects.toThrow(
      "Product not found"
    );
  });
});
