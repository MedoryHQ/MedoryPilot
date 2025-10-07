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
  invalidAccessToken: {
    en: "Access denied. Invalid access token.",
    ka: "წვდომა უარყოფილია. არასწორი access ტოკენი.",
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
  verificationCodeExpired: {
    en: "Verification code expired",
    ka: "ვერიფიკაციის კოდი ვადა ამოეწურა",
  },
  smsCodeisInvalid: {
    en: "SMS code is invalid",
    ka: "SMS კოდი არ არის ვალიდური",
  },
  verificationCodeStillValid: {
    en: "verification code is still valid",
    ka: "ვერიფიკაციის კოდის ვადა ჯერ არ არის გასული",
  },
  unauthorized: {
    en: "Authorization failed.",
    ka: "ავტორიზაცია წარუმატებლად დასრულდა.",
  },
  verificationRequired: {
    en: "Verification required.",
    ka: "ვერიფიკაცია აუცილებელია.",
  },
  verificationExpired: {
    en: "Verification expired. Please request a new code.",
    ka: "ვერიფიკაციის ვადა ამოიწურა. გთხოვთ, მოითხოვოთ ახალი კოდი.",
  },
  determineIpFailed: {
    en: "Determination of ip failed",
    ka: "IP-ის განსაზღვრა ვერ მოხერხდა",
  },
  adminAuthenticateFailed: {
    en: "Admin authentication failed.",
    ka: "ადმინისტრატორის ავტორიზაცია წარუმატებლად დასრულდა.",
  },
  headerNotFound: {
    en: "Header not found",
    ka: "Header ვერ მოიძებნა",
  },
  tariffNotFound: {
    en: "Tariff not found",
    ka: "ტარიფი ვერ მოიძებნა",
  },
  faqNotFound: {
    en: "FAQ not found",
    ka: "FAQ ვერ მოიძებნა",
  },
  introduceNotFound: {
    en: "Introduce not found",
    ka: "შესავალი ვერ მოიძებნა",
  },
  serviceNotFound: {
    en: "Service not found",
    ka: "სერვისი ვერ მოიძებნა",
  },
  contactNotFound: {
    en: "Contact not found",
    ka: "კონტაქტი ვერ მოიძებნა",
  },
  newsNotFound: {
    en: "News not found",
    ka: "სიახლე ვერ მოიძებნა",
  },
  blogNotFound: {
    en: "Blog not found",
    ka: "ბლოგი ვერ მოიძებნა",
  },
  pageNotFound: {
    en: "Page not found",
    ka: "გვერდი ვერ მოიძებნა",
  },
  socialNotFound: {
    en: "Social not found",
    ka: "სოციალური ქსელი ვერ მოიძებნა",
  },
  footerNotFound: {
    en: "Footer not found",
    ka: "Footer ვერ მოიძებნა",
  },
  invalidImage: {
    en: "Invalid Image",
    ka: "არასწორი სურათი",
  },
  onlyOneActiveHeaderAllowed: {
    en: "Only one active header is allowed",
    ka: "მხოლოდ ერთი აქტიური header არის დაშვებული",
  },

  // Messages
  smsVerificationSent: {
    en: "Verification code sent to your phone number.",
    ka: "ვერიფიკაციის კოდი გამოიგზავნა თქვენს ტელეფონის ნომერზე.",
  },
  verificationSuccessful: {
    en: "Verification successful",
    ka: "ვერიფიკაცია წარმატებით დასრულდა",
  },
  loginSuccessful: {
    en: "Login successful",
    ka: "შესვლა წარმატებით დასრულდა",
  },
  verificationCodeResent: {
    en: "Verification code resent successfully",
    ka: "ვერიფიკაცის კოდი წარმატებით გამოიგზავნა ხელახლა",
  },
  codeSent: {
    en: "Code sent successfully",
    ka: "კოდი წარმატებით გამოიგზავნა",
  },
  codeVerified: {
    en: "Code verified successfully",
    ka: "კოდი ვერიფიცირებულია",
  },
  tokenRefreshed: {
    en: "Token refreshed",
    ka: "ტოკენი განახლდა",
  },
  headerDeleted: {
    en: "Header deleted successfully",
    ka: "Header წარმატებით წაიშალა",
  },
  tariffDeleted: {
    en: "Tariff deleted successfully",
    ka: "ტარიფი წარმატებით წაიშალა",
  },
  FAQDeleted: {
    en: "FAQ deleted successfully",
    ka: "FAQ წარმატებით წაიშალა",
  },
  introduceDeleted: {
    en: "Introduce deleted successfully",
    ka: "შესავალი წარმატებით წაიშალა",
  },
  serviceDeleted: {
    en: "Service deleted successfully",
    ka: "სერვისი წარმატებით წაიშალა",
  },
  contactDeleted: {
    en: "Contact deleted successfully",
    ka: "კონტაქტი წარმატებით წაიშალა",
  },
  newsDeleted: {
    en: "News deleted successfully",
    ka: "სიახლე წარმატებით წაიშალა",
  },
  blogDeleted: {
    en: "Blog deleted successfully",
    ka: "ბლოგი წარმატებით წაიშალა",
  },
  pageDeleted: {
    en: "Page deleted successfully",
    ka: "გვერდი წარმატებით წაიშალა",
  },
  socialDeleted: {
    en: "Social deleted successfully",
    ka: "სოციალური ქსელი წარმატებით წაიშალა",
  },
  footerDeleted: {
    en: "Footer deleted successfully",
    ka: "Footer წარმატებით წაიშალა",
  },
  footerAlreadyExists: {
    en: "Footer already exists",
    ka: "Footer უკვე არსებობს",
  },
  imageUploaded: {
    en: "Image uploaded successfully",
    ka: "სურათი წარმატებით აიტვირთა",
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
  invalidId: {
    en: "Invalid id",
    ka: "id არასწორია",
  },
  invalidFooterId: {
    en: "Invalid footer id",
    ka: "Footer-ის id არასწორია",
  },
  invalidCode: {
    en: "Invalid OTP code",
    ka: "OTP კოდი არასწორია",
  },
  passwordChanged: {
    en: "Password changed",
    ka: "პაროლი შეიცვალა",
  },
  invalidResetPasswordType: {
    en: "Reset password type is invalid",
    ka: "პაროლის აღდგენის ტიპი არასწორია",
  },
  invalidTariffType: {
    en: "Invalid tariff type",
    ka: "არასწორი ტარიფის ტიპი",
  },
  invalidPrice: {
    en: "Invalid price",
    ka: "არასწორი ფასი",
  },
  invalidOrder: {
    en: "Invalid Order",
    ka: "არასწორი თანმიმდევრობა",
  },
  invalidIcon: {
    en: "Invalid Icon",
    ka: "არასწორი Icon",
  },
  invalidBackground: {
    en: "Invalid Background",
    ka: "არასწორი Background",
  },
  invalidLocation: {
    en: "Invalid Location",
    ka: "არასწორი ლოკაცია",
  },
  invalidShowInLanding: {
    en: "Invalid show in landing",
    ka: "არასწორი ლენდინგზე გამოჩენა",
  },
  invalidSlug: {
    en: "Invalid Slug",
    ka: "არასწორი სლაგი",
  },
  categoriesLength: {
    en: "Categories must be an array with at least 1 category",
    ka: "კატეგორიების მასივში უნდა იყოს მინიმუმ 1 კატეგორია",
  },
  invalidName: {
    en: "Invalid Name",
    ka: "არასწორი სახელი",
  },
  invalidUrl: {
    en: "Invalid Url",
    ka: "არასწორი ლინკი",
  },
  invalidPhone: {
    en: "Invalid Phone",
    ka: "არასწორი ტელეფონის ნომერი",
  },
} as const;

export type ErrorKey = keyof typeof errorMessages;
export type TranslatedMessage = (typeof errorMessages)[ErrorKey];
