import { prisma } from "@/configs/prisma"; // Pfad anpassen

export default async function handler(req, res) {
  const users = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true },
  });

  res.status(200).json(users);
}
