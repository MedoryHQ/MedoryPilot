import { PrismaClient } from "@prisma/client";
import * as seedData from "./seedData";

const prisma = new PrismaClient();

const main = async () => {
  await seedData.seedLanguages(prisma);
  await seedData.seedUsers(prisma);
};

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
