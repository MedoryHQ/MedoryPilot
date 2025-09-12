export interface IForgotAdminPasswordVerification {
  email: string;
  code: string;
}

export interface IResetAdminPassword {
  email: string;
  code: string;
  password: string;
}

export interface IAdminLogin {
  email: string;
  password: string;
  remember: boolean;
}

export interface IForgotPasswordVerification {
  phoneNumber: string;
  smsCode: string;
}

export interface IOtpVerification {
  code: string;
}

export interface IOtpCodeResend {
  email: string;
}
