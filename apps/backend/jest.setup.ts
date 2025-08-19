jest.mock("@/utils/logging", () => ({
  selectLogger: jest.fn(() => ({
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  })),
  getClientIp: jest.fn().mockResolvedValue("hashedIp"),
  logAdminInfo: jest.fn(),
  logAdminWarn: jest.fn(),
  logAdminError: jest.fn(),
}));
