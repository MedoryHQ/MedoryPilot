import { validate } from "uuid";

export const isUuid = (uuid: string) => {
  return validate(uuid);
};
