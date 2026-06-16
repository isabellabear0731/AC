import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

console.log(process.env.DATABASE_URL?.slice(0, 30));

async function main() {
  const hashedPassword = await bcrypt.hash(
    "testtest123",
    10
  );

  const admin = await prisma.user.create({
    data: {
      email: "isabellabear0731@gmail.com",
      passwordHash: hashedPassword,
      firstName: "Isabella",
      lastName: "Huang",
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("Admin created:");
  console.log(admin);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });