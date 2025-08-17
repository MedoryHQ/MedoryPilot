import { getEnvVariable } from "@/config";
import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const users: Prisma.AdminCreateInput[] = [
  {
    email: getEnvVariable("EMAIL"),
    firstName: getEnvVariable("ADMIN_FIRST_NAME"),
    lastName: getEnvVariable("ADMIN_LAST_NAME"),
    passwordHash: bcrypt.hashSync(
      getEnvVariable("ADMIN_PASSWORD"),
      +getEnvVariable("SALT_ROUNDS")
    ),
  },
];

export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.admin.createMany({
    data: users,
    skipDuplicates: true,
  });
};
