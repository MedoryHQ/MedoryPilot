import { Response } from "express";

export const errorMessages = {
  // Controller errors
  userNotFound: {
    en: "User not found",
    ka: "მომხმარებელი ვერ მოიძებნა",
  },
  invalidCredentials: {
    en: "Invalid email or password",
    ka: "არასწორი ელ-ფოსტა ან პაროლი",
  },
  invalidRefreshToken: {
    en: "Access denied. Invalid refresh token.",
    ka: "წვდომა უარყოფილია. არასწორი refresh ტოკენი.",
  },
  jwtSecretNotProvided: {
    en: "JWT secrets not provided.",
    ka: "JWT secret-ების მოწოდება აუცილებელია.",
  },
  noTokenProvided: {
    en: "Access denied. No token provided.",
    ka: "წვდომა უარყოფილია. ტოკენის მოწოდება აუცილებელია",
  },
  smsSendFaild: {
    en: "Failed to send SMS.",
    ka: "SMS-ის გაგზავნა ვერ მოხერხდა.",
  },
  smsVerificationSent: {
    en: "Verification code sent to your phone number.",
    ka: "ვერიფიკაციის კოდი გამოიგზავნა თქვენს ტელეფონის ნომერზე.",
  },

  // Validation errors
  invalidPhoneNumber: {
    en: "Invalid phone number. It should start with +995 followed by the valid number.",
    ka: "ტელეფონის ნომერი არასწორია. ის უნდა იწყებოდეს +995 ნიშნით და სწორი ნომრით.",
  },
  phoneAlreadyExists: {
    en: "User with this phone number already exists",
    ka: "მომხმარებელი ამ ტელეფონის ნომრით უკვე არსებობს",
  },
  invalidEmail: {
    en: "Invalid email",
    ka: "ელ-ფოსტა არასწორია",
  },
  emailAlreadyExists: {
    en: "User with this email already exists",
    ka: "მომხმარებელი ამ ელ-ფოსტით უკვე არსებობს",
  },
  invalidFirstName: {
    en: "Invalid first name",
    ka: "სახელი არასწორია",
  },
  invalidLastName: {
    en: "Invalid last name",
    ka: "გვარი არასწორია",
  },
  invalidDateOfBirth: {
    en: "Invalid date of birth",
    ka: "დაბადების თარიღი არასწორია",
  },
  invalidPersonalId: {
    en: "Invalid personal ID",
    ka: "პირადი ნომერი არასწორია",
  },
  personalIdLength: {
    en: "Personal ID must be between 9 and 20 characters long",
    ka: "პირადი ნომერი უნდა იყოს 9-დან 20 სიმბოლომდე სიგრძის",
  },
  invalidPassword: {
    en: "Invalid password",
    ka: "პაროლი არასწორია",
  },
  passwordLength: {
    en: "Password must be between 8 and 100 characters long",
    ka: "პაროლი უნდა იყოს 8-დან 100 სიმბოლომდე სიგრძის",
  },
  invalidConfirmPassword: {
    en: "Invalid confirm password",
    ka: "პაროლის გადამოწმება არასწორია",
  },
  passwordsNotMatch: {
    en: "Passwords must match",
    ka: "პაროლები არ ემთხვევა",
  },
};

type ErrorKey = keyof typeof errorMessages;
type TranslatedMessage = (typeof errorMessages)[ErrorKey];

export function getResponseMessage(messageKey: ErrorKey): TranslatedMessage {
  return errorMessages[messageKey];
}

export function sendError(
  res: Response,
  statusCode: number,
  messageKey: ErrorKey
) {
  const message = getResponseMessage(messageKey);

  return res.status(statusCode).json({
    error: message,
  });
}
