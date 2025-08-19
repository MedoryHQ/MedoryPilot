import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/routes/admin/**/*.ts"],
  testMatch: ["<rootDir>/src/tests/admin/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@errors/(.*)$": "<rootDir>/src/errors/$1",
  },
};

export default config;
