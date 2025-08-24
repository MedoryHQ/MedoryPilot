export interface IForgotAdminPasswordVerification {
  email: string;
  smsCode: string;
}

export interface IResetAdminPassword {
  email: string;
  smsCode: string;
  password: string;
}

export interface IAdminLogin {
  email: string;
  password: string;
  remember: boolean;
}
