import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required."
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// Reuse the client in every server runtime. This avoids creating additional
// database pools during warm Vercel invocations while preserving request-level
// authorization in callers.
globalForPrisma.prisma = prisma;
