import { getEnvVariable } from "../../src/config";
import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const users: Prisma.AdminCreateInput[] = [
  {
    email: "beka.chaduneli.1@btu.edu.ge",
    firstName: "Beka",
    lastName: "Chaduneli",
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
