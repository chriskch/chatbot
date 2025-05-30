import { PrismaClient } from "@prisma/client";

console.log("✅ Using database:", process.env.DATABASE_URL);
export const prisma = new PrismaClient();
