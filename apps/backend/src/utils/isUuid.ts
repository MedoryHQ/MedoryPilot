import { validate, version } from "uuid";

export const isUuid = (uuid: string) => {
  return validate(uuid) && version(uuid) === 7;
};
