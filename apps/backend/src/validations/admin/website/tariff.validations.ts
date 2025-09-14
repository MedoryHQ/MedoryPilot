import { uuidValidation } from "@/validations/shared";
import { body } from "express-validator";

export const fetchTariffValidation = [
  uuidValidation,
  body("type").isIn(["active", "history"]).withMessage("invalidTariffType"),
];

export const deleteTariffValidation = fetchTariffValidation;
