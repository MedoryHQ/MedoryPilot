export interface ICreatePendingUser {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  personalId: string;
  dateOfBirth: Date;
  email?: string;
  password: string;
}
