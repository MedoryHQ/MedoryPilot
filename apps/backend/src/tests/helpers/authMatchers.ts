import { ErrorMessages } from "@/types/global";
import { validateAdminLogin, validateCustomerLogin } from "@/utils";

export const authMatchers = {
  toBeValidAdminLoginResponse(received: any) {
    const pass = validateAdminLogin(received);
    return {
      pass,
      message: () =>
        pass
          ? "response is a valid ADMIN login response"
          : "expected valid ADMIN login response structure",
    };
  },

  toBeValidCustomerLoginResponse(received: any) {
    const pass = validateCustomerLogin(received);
    return {
      pass,
      message: () =>
        pass
          ? "response is a valid CUSTOMER login response"
          : "expected valid CUSTOMER login response structure",
    };
  },

  toHaveErrorMessage(
    received: any,
    expectedKey: string,
    errorMessages: ErrorMessages
  ) {
    const found = received.errors?.some(
      (e: any) => e.message?.en === errorMessages[expectedKey]?.en
    );
    return {
      pass: found,
      message: () =>
        found
          ? `found error message for key "${expectedKey}"`
          : `expected error message for key "${expectedKey}"`,
    };
  },

  toHaveStatus(received: any, expectedStatus: number) {
    const pass = received.status === expectedStatus;
    return {
      pass,
      message: () =>
        pass
          ? `response has status ${expectedStatus}`
          : `expected status ${expectedStatus}, received ${received.status}`,
    };
  },

  toHaveField(received: any, field: string) {
    const pass = field in received;
    return {
      pass,
      message: () =>
        pass
          ? `response has field "${field}"`
          : `expected response to have field "${field}"`,
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAdminLoginResponse(): R;
      toBeValidCustomerLoginResponse(): R;
      toHaveErrorMessage(expectedKey: string, errorMessages: ErrorMessages): R;
      toHaveStatus(expectedStatus: number): R;
      toHaveField(field: string): R;
    }
  }
}
