export interface User {
  id: string;
  phoneNumber: string;
}

export interface ICreatePendingUser {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  personalId: string;
  dateOfBirth: Date;
  email?: string;
  password: string;
}

export interface IUserVerify {
  code: string;
  id: string;
  phoneNumber: string;
}

export interface IUserLogin {
  phoneNumber: string;
  password: string;
}

export interface IResendUserVerificationCode {
  phoneNumber: string;
}

export interface IForgotPassword extends IResendUserVerificationCode {}

export interface IForgotPasswordVerification {
  phoneNumber: string;
  smsCode: string;
}

export interface IResetPassword {
  phoneNumber: string;
  smsCode: string;
  password: string;
}

export interface IForgetPasswordWithEmail {
  email: string;
}
