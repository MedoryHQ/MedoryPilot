import { body } from "express-validator";

export const loginValidation = [
  body("email").isEmail().withMessage({
    en: "Invalid email",
    ka: "არასწორი ელ-ფოსტა",
  }),
  body("password").isString().withMessage({
    en: "Invalid password",
    ka: "პაროლი არასწორია",
  }),
];
