import { prisma } from "@/config";
import { NextFunction, Request, Response } from "express";
import {
  calculateAge,
  createPassword,
  generateSmsCode,
  getResponseMessage,
  sendError,
  cookieOptions,
  generateAccessToken,
  generateRefreshToken,
  verifyField,
  generateTokens,
  // mailer,
  verifyRefreshToken,
  inMinutes,
  logCatchyError,
  getClientIp,
  hashIp,
  logInfo,
  logWarn,
} from "@/utils";
import {
  ICreatePendingUser,
  IForgetPasswordWithEmail,
  IForgotPassword,
  IForgotPasswordVerification,
  IResendUserVerificationCode,
  IResetPassword,
  IUserLogin,
  IUserVerify,
} from "@/types/customer";

export const UserRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const {
      phoneNumber,
      email,
      firstName,
      lastName,
      personalId,
      dateOfBirth,
      password,
    } = req.body as ICreatePendingUser;

    logInfo("User registration attempt", {
      ip: hashedIp,
      path: req.path,
      method: req.method,
      event: "user_registration_attempt",
    });

    const existingUser = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser) {
      logWarn("User registration failed: phone already exists", {
        ip: hashedIp,
        event: "user_registration_failed",
      });
      return sendError(req, res, 409, "phoneAlreadyExists");
    }

    const passwordHash = await createPassword(password);
    const fullName = `${firstName} ${lastName}`;
    const {
      hashedSmsCode,
      // smsCode
    } = await generateSmsCode();

    let age: number | null;
    try {
      age = calculateAge(dateOfBirth);
    } catch {
      return sendError(req, res, 400, "invalidDateOfBirth");
    }

    const newPendingUser = await prisma.pendingUser.create({
      data: {
        phoneNumber,
        passwordHash,
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
        personalId,
        dateOfBirth,
        email,
        firstName,
        lastName,
        fullName,
        ...(age && { age }),
      },
    });

    // const smsResponse = await sendSMS(
    //   phoneNumber,
    //   `Verification Code: ${smsCode}`
    // );

    // if (!smsResponse.success) return sendError(req, res, 500, "smsSendFaild")

    logInfo("User registered successfully", {
      ip: hashedIp,
      path: req.path,
      userId: newPendingUser.id,
      event: "user_registered",
    });

    return res.status(200).json({
      message: getResponseMessage("smsVerificationSent"),
      data: {
        id: newPendingUser.id,
        phoneNumber: newPendingUser.phoneNumber,
      },
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("User registration exception", error, {
      ip: hashedIp,
      event: "user_registration_exception",
    });

    return next(error);
  }
};

export const UserVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { code, id, phoneNumber } = req.body as IUserVerify;

    logInfo("User verification attempt", {
      ip: hashedIp,
      id,
      event: "user_verification_attempt",
    });

    const pending = await prisma.pendingUser.findUnique({
      where: {
        id,
        phoneNumber,
      },
    });

    if (!pending) {
      logWarn("User verification failed: user not found", {
        ip: hashedIp,
        id,
        event: "user_verification_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (new Date(pending?.smsCodeExpiresAt) < new Date()) {
      logWarn("User verification failed: code expired", {
        ip: hashedIp,
        id,
        event: "user_verification_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = pending.smsCode && verifyField(code, pending.smsCode);

    if (!isSmsValid) {
      logWarn("User verification failed: invalid code", {
        ip: hashedIp,
        id,
        event: "user_verification_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }
    let age: number | null;
    try {
      age = calculateAge(pending.dateOfBirth);
    } catch {
      return sendError(req, res, 400, "invalidDateOfBirth");
    }

    const fullName = `${pending.firstName} ${pending.lastName}`;

    const user = await prisma.user.create({
      data: {
        phoneNumber: pending.phoneNumber,
        passwordHash: pending.passwordHash,
        firstName: pending.firstName,
        lastName: pending.lastName,
        fullName,
        age,
        dateOfBirth: pending.dateOfBirth,
        personalId: pending.personalId,
        ...(pending.email && { email: pending.email }),
        ...(age && { age }),
        isVerified: true,
      },
      include: {
        photo: true,
      },
    });

    await prisma.pendingUser.delete({
      where: {
        id,
      },
    });

    const payload = { id: user.id, phoneNumber: user.phoneNumber };

    const access = generateAccessToken(payload, "USER");
    const refresh = generateRefreshToken(payload, "USER");

    await prisma.refreshToken.create({
      data: {
        token: refresh.token,
        user: {
          connect: { id: user.id },
        },
        expiresAt: new Date(Date.now() + refresh.expiresIn),
      },
    });

    res.cookie("refreshToken", refresh.token, {
      ...cookieOptions,
      maxAge: refresh.expiresIn,
    });

    res.cookie("accessToken", access.token, {
      ...cookieOptions,
      maxAge: access.expiresIn,
    });

    const { passwordHash, smsCode, info, ...userData } = user;

    logInfo("User verified successfully", {
      ip: hashedIp,
      userId: user.id,
      event: "user_verified",
    });
    return res.status(200).json({
      message: getResponseMessage("verificationSuccessful"),
      data: {
        ...userData,
        verified: true,
      },
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("User verification exception", error, {
      ip: hashedIp,
      event: "user_verification_exception",
    });

    return next(error);
  }
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { phoneNumber, password } = req.body as IUserLogin;

    logInfo("User login attempt", {
      ip: hashedIp,
      event: "user_login_attempt",
    });
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!user) {
      logWarn("User login failed: not found", {
        ip: hashedIp,
        event: "user_login_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    const isPasswordValid = verifyField(password, user.passwordHash);

    if (!isPasswordValid) {
      logWarn("User login failed: invalid password", {
        ip: hashedIp,
        userId: user.id,
        event: "user_login_failed",
      });
      return sendError(req, res, 400, "invalidPassword");
    }

    const {
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    } = await generateTokens(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
      },
      "USER"
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user: {
          connect: { id: user.id },
        },
        expiresAt: new Date(Date.now() + refreshTokenExpires),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenExpires,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: accessTokenExpires,
    });

    const { passwordHash, smsCode, info, ...userData } = user;

    logInfo("User login success", {
      ip: hashedIp,
      userId: user.id,
      event: "user_login_success",
    });
    return res.status(200).json({
      message: getResponseMessage("loginSuccessful"),
      data: {
        user: {
          ...userData,
        },
      },
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("User login exception", error, {
      ip: hashedIp,
      event: "user_login_exception",
    });
    return next(error);
  }
};

export const resendUserVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { phoneNumber } = req.body as IResendUserVerificationCode;

    logInfo("Resend verification attempt", {
      ip: hashedIp,
      event: "user_resend_verification_attempt",
    });
    const user = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      logWarn("Resend verification failed: user not found", {
        ip: hashedIp,
        event: "user_resend_verification_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logWarn("Resend verification failed: code still valid", {
        ip: hashedIp,
        event: "user_resend_verification_failed",
      });

      return sendError(req, res, 400, "verificationCodeStillValid");
    }

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    await prisma.pendingUser.update({
      where: {
        id: user.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });

    // const smsResponse = await sendSMS(
    //   phoneNumber,
    //   `Verification Code: ${smsCode}`
    // );

    // if (!smsResponse.success) return sendError(req, res, 500, "smsSendFaild")

    logInfo("Verification code resent successfully", {
      ip: hashedIp,
      userId: user.id,
      event: "user_verification_code_resent",
    });

    return res.status(200).json({
      message: getResponseMessage("verificationCodeResent"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Resend verification exception", error, {
      ip: hashedIp,
      event: "user_resend_verification_exception",
    });

    return next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { phoneNumber } = req.body as IForgotPassword;

    logInfo("Forget password attempt", {
      ip: hashedIp,
      event: "user_forgot_password_attempt",
    });
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      logWarn("Forgot password failed: user not found", {
        ip: hashedIp,
        event: "user_forgot_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logWarn("Forgot password failed: code still valid", {
        ip: hashedIp,
        event: "user_forgot_password_failed",
      });
      return sendError(req, res, 400, "verificationCodeStillValid");
    }

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    // const smsResponse = await sendSMS(
    //   phoneNumber,
    //   `Verification Code: ${smsCode}, please enter code for reset.`
    // );

    // if (!smsResponse.success) return sendError(req, res, 500, "smsSendFaild")

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });

    logInfo("Forgot password code sent", {
      ip: hashedIp,
      userId: user.id,
      event: "user_forgot_password_code_sent",
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Forgot password exception", error, {
      ip: hashedIp,
      event: "user_forgot_password_exception",
    });

    next(error);
  }
};

export const forgotPasswordWithEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { email } = req.body as IForgetPasswordWithEmail;

    logInfo("Forget password with email attempt", {
      ip: hashedIp,
      event: "user_forgot_password_email_attempt",
    });
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      logWarn("Forgot password by email failed: user not found", {
        ip: hashedIp,
        event: "user_forgot_password_email_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logWarn("Forgot password by email failed: code still valid", {
        ip: hashedIp,
        event: "user_forgot_password_email_failed",
      });
      return sendError(req, res, 400, "verificationCodeStillValid");
    }
    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    // await mailer.sendOtpCode(email, smsCode);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });
    logInfo("Forgot password code sent via email", {
      ip: hashedIp,
      userId: user.id,
      event: "user_forgot_password_email_code_sent",
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Forgot password by email exception", error, {
      ip: hashedIp,
      event: "user_forgot_password_email_exception",
    });

    next(error);
  }
};

export const forgotPasswordVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { smsCode, phoneNumber } = req.body as IForgotPasswordVerification;

    logInfo("Forget password verification attempt", {
      ip: hashedIp,
      event: "user_forgot_password_verification_attempt",
    });

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user || !user.smsCode) {
      logWarn("Forgot password verification failed: user not found", {
        ip: hashedIp,
        event: "user_forgot_password_verification_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !user.smsCodeExpiresAt ||
      new Date(user.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Forgot password verification failed: code expired", {
        ip: hashedIp,
        event: "user_forgot_password_verification_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = verifyField(smsCode, user.smsCode);
    if (!isSmsValid) {
      logWarn("Forgot password verification failed: invalid code", {
        ip: hashedIp,
        event: "user_forgot_password_verification_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    logInfo("Forgot password code verified successfully", {
      ip: hashedIp,
      userId: user.id,
      event: "user_forgot_password_code_verified",
    });
    return res.status(200).json({
      message: getResponseMessage("codeVerified"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Forgot password verification exception", error, {
      ip: hashedIp,
      event: "user_forgot_password_verification_exception",
    });
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { type, phoneNumber, email, password, smsCode } =
      req.body as IResetPassword;

    logInfo("Reset password attempt", {
      ip: hashedIp,
      event: "user_reset_password_attempt",
    });

    const whereClause =
      type === "phoneNumber"
        ? { phoneNumber, isVerified: true }
        : { email, isVerified: true };

    const user = await prisma.user.findUnique({ where: whereClause });

    if (!user || !user.smsCode) {
      logWarn("Reset password failed: user not found or no code", {
        ip: hashedIp,
        event: "user_reset_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !user.smsCodeExpiresAt ||
      new Date(user.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Reset password failed: code expired", {
        ip: hashedIp,
        event: "user_reset_password_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = verifyField(smsCode, user.smsCode);
    if (!isSmsValid) {
      logWarn("Reset password failed: invalid code", {
        ip: hashedIp,
        event: "user_reset_password_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    const passwordHash = await createPassword(password);

    const newUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        smsCode: null,
      },
    });

    logInfo("Password reset successfully", {
      ip: hashedIp,
      userId: user.id,
      event: "user_password_reset",
    });
    return res.status(200).json({
      message: getResponseMessage("passwordChanged"),
      user: newUser,
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Reset password exception", error, {
      ip: hashedIp,
      event: "user_reset_password_exception",
    });

    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const oldRefreshToken = req.cookies.refreshToken;

    logInfo("Token refresh attempt", {
      ip: hashedIp,
      event: "user_token_refresh_attempt",
    });
    if (!oldRefreshToken) {
      logWarn("Refresh token failed: unauthorized", {
        ip: hashedIp,
        event: "user_token_refresh_failed",
      });
      return sendError(req, res, 401, "unauthorized");
    }

    let decoded;
    try {
      decoded = await verifyRefreshToken(oldRefreshToken);
    } catch {
      logWarn("Refresh token failed: invalid token", {
        ip: hashedIp,
        event: "user_token_refresh_failed",
      });
      return sendError(req, res, 401, "invalidRefreshToken");
    }

    const { token: newAccessToken, expiresIn: accessExpires } =
      generateAccessToken(
        { id: decoded.id, phoneNumber: decoded.phoneNumber },
        "USER"
      );

    const { token: newRefreshToken, expiresIn: refreshExpires } =
      generateRefreshToken(
        { id: decoded.id, phoneNumber: decoded.phoneNumber },
        "USER"
      );

    await prisma.refreshToken.delete({
      where: { token: oldRefreshToken },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.id,
        expiresAt: new Date(Date.now() + refreshExpires),
      },
    });

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: accessExpires,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: refreshExpires,
    });

    logInfo("Refresh token successfully renewed", {
      ip: hashedIp,
      userId: decoded.id,
      event: "user_token_refreshed",
    });

    return res.status(200).json({
      message: getResponseMessage("tokenRefreshed"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Refresh token exception", error, {
      ip: hashedIp,
      event: "user_token_refresh_exception",
    });
    return next(error);
  }
};
