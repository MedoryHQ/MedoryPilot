import { PrismaClient } from "@prisma/client";

const languages = [
  {
    code: "en",
    name: "English",
    order: 1,
  },
  {
    code: "ka",
    name: "Georgian",
    order: 2,
  },
];

export const seedLanguages = async (prisma: PrismaClient) => {
  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: language,
      create: language,
    });
  }
};
