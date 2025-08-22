export const normalizePhoneNumber = (phone: string) => {
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  return phone;
};
