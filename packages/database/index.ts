import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from 'dotenv';
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from './generated/prisma/client';

