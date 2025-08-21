import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/routes/**/*.ts"],
  testMatch: ["<rootDir>/src/tests/integrated/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@errors/(.*)$": "<rootDir>/src/errors/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  modulePaths: ["<rootDir>"],
};

export default config;
