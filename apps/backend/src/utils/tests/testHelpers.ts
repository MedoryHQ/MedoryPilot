export function validateAdminLogin(received: any) {
  const { user, accessToken, refreshToken, userType } = received.data || {};
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    typeof accessToken === "string" &&
    typeof refreshToken === "string" &&
    userType === "ADMIN"
  );
}

export function validateCustomerLogin(received: any) {
  const { user } = received.data || {};
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.phoneNumber === "string" &&
    typeof user.passwordHash === "undefined"
  );
}
