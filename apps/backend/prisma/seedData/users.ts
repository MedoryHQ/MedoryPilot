import { getEnvVariable } from "../../src/config";
import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const users: Prisma.AdminCreateInput[] = [
  {
    email: getEnvVariable("email"),
    firstName: getEnvVariable("adminFirstName"),
    lastName: getEnvVariable("adminLastName"),
    passwordHash: bcrypt.hashSync(
      getEnvVariable("adminPassword"),
      +getEnvVariable("saltRounds")
    ),
  },
];

export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.admin.createMany({
    data: users,
    skipDuplicates: true,
  });
};
