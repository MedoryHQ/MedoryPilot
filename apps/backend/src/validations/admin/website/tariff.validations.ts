import { uuidValidation } from "@/validations/shared";
import { body } from "express-validator";

export const fetchTariffValidation = [uuidValidation()];

export const deleteTariffValidation = fetchTariffValidation;

export const createTariffValidation = [
  body("price").isNumeric().withMessage("invalidPrice"),
];

export const updateTariffValidation = [
  uuidValidation(),
  ...createTariffValidation,
];
