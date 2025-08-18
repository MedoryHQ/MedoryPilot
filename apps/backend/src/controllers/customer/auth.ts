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
import logger from "@/logger";

export const UserRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      phoneNumber,
      email,
      firstName,
      lastName,
      personalId,
      dateOfBirth,
      password,
    } = req.body as ICreatePendingUser;

    logger.info("User registration attempt", {
      ip: req.ip,
      path: req.path,
      method: req.method,
      phoneNumber,
      email,
    });

    const existingUser = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser) {
      logger.warn("User registration failed: phone already exists", {
        ip: req.ip,
        phoneNumber,
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

    logger.info("User registered successfully", {
      ip: req.ip,
      path: req.path,
      userId: newPendingUser.id,
      phoneNumber: newPendingUser.phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("smsVerificationSent"),
      data: {
        id: newPendingUser.id,
        phoneNumber: newPendingUser.phoneNumber,
      },
    });
  } catch (error) {
    logCatchyError("User registration exception", error, {
      phoneNumber: req.body.phoneNumber,
      ip: req.ip,
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
    const { code, id, phoneNumber } = req.body as IUserVerify;
    logger.info("User verification attempt", { ip: req.ip, id, phoneNumber });

    const pending = await prisma.pendingUser.findUnique({
      where: {
        id,
        phoneNumber,
      },
    });

    if (!pending) {
      logger.warn("User verification failed: user not found", {
        ip: req.ip,
        id,
        phoneNumber,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (new Date(pending?.smsCodeExpiresAt) < new Date()) {
      logger.warn("User verification failed: code expired", {
        ip: req.ip,
        id,
        phoneNumber,
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = pending.smsCode && verifyField(code, pending.smsCode);

    if (!isSmsValid) {
      logger.warn("User verification failed: invalid code", {
        ip: req.ip,
        id,
        phoneNumber,
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

    logger.info("User verified successfully", {
      ip: req.ip,
      userId: user.id,
      phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("verificationSuccessful"),
      data: {
        ...userData,
        verified: true,
      },
    });
  } catch (error) {
    logCatchyError("User verification exception", error, {
      phoneNumber: req.body.phoneNumber,
      ip: req.ip,
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
    const { phoneNumber, password } = req.body as IUserLogin;

    logger.info("User login attempt", { ip: req.ip, phoneNumber });

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!user) {
      logger.warn("User login failed: not found", { ip: req.ip, phoneNumber });
      return sendError(req, res, 404, "userNotFound");
    }
    const isPasswordValid = verifyField(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn("User login failed: invalid password", {
        id: user.id,
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

    logger.info("User login success", { ip: req.ip, userId: user.id });

    return res.status(200).json({
      message: getResponseMessage("loginSuccessful"),
      data: {
        user: {
          ...userData,
        },
      },
    });
  } catch (error) {
    logCatchyError("User login exception", error, {
      phoneNumber: req.body.phoneNumber,
      ip: req.ip,
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
    const { phoneNumber } = req.body as IResendUserVerificationCode;

    logger.info("Resend verification attempt", { ip: req.ip, phoneNumber });

    const user = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      logger.warn("Resend verification failed: user not found", {
        ip: req.ip,
        phoneNumber,
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logger.warn("Resend verification failed: code still valid", {
        ip: req.ip,
        phoneNumber,
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

    logger.info("Verification code resent successfully", {
      ip: req.ip,
      userId: user.id,
      phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("verificationCodeResent"),
    });
  } catch (error) {
    logCatchyError("Resend verification exception", error, {
      ip: req.ip,
      phoneNumber: req.body.phoneNumber,
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
    const { phoneNumber } = req.body as IForgotPassword;

    logger.info("forget password attempt", { ip: req.ip, phoneNumber });

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      logger.warn("Forgot password failed: user not found", {
        ip: req.ip,
        phoneNumber,
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logger.warn("Forgot password failed: code still valid", {
        ip: req.ip,
        phoneNumber,
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

    logger.info("Forgot password code sent", {
      ip: req.ip,
      userId: user.id,
      phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    logCatchyError("Forgot password exception", error, {
      ip: req.ip,
      phoneNumber: req.body.phoneNumber,
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
    const { email } = req.body as IForgetPasswordWithEmail;

    logger.info("forget password with email attempt", { ip: req.ip, email });

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      logger.warn("Forgot password by email failed: user not found", {
        ip: req.ip,
        email,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (user.smsCodeExpiresAt && new Date(user.smsCodeExpiresAt) > new Date()) {
      logger.warn("Forgot password by email failed: code still valid", {
        ip: req.ip,
        email,
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
    logger.info("Forgot password code sent via email", {
      ip: req.ip,
      userId: user.id,
      email,
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    logCatchyError("Forgot password by email exception", error, {
      ip: req.ip,
      email: req.body.email,
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
    const { smsCode, phoneNumber } = req.body as IForgotPasswordVerification;

    logger.info("forget password verification attempt", {
      ip: req.ip,
      code: smsCode,
      phoneNumber,
    });

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user || !user.smsCode) {
      logger.warn("Forgot password verification failed: user not found", {
        ip: req.ip,
        phoneNumber,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !user.smsCodeExpiresAt ||
      new Date(user.smsCodeExpiresAt) < new Date()
    ) {
      logger.warn("Forgot password verification failed: code expired", {
        ip: req.ip,
        phoneNumber,
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = verifyField(smsCode, user.smsCode);
    if (!isSmsValid) {
      logger.warn("Forgot password verification failed: invalid code", {
        ip: req.ip,
        phoneNumber,
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    logger.info("Forgot password code verified successfully", {
      ip: req.ip,
      userId: user.id,
      phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("codeVerified"),
    });
  } catch (error) {
    logCatchyError("Forgot password verification exception", error, {
      ip: req.ip,
      phoneNumber: req.body.phoneNumber,
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
    const { type, phoneNumber, email, password, smsCode } =
      req.body as IResetPassword;

    logger.info("reset password attempt", {
      ip: req.ip,
      code: smsCode,
      ...(type === "phoneNumber"
        ? {
            phoneNumber,
          }
        : { email }),
    });

    const whereClause =
      type === "phoneNumber"
        ? { phoneNumber, isVerified: true }
        : { email, isVerified: true };

    const user = await prisma.user.findUnique({ where: whereClause });

    if (!user || !user.smsCode) {
      logger.warn("Reset password failed: user not found or no code", {
        ip: req.ip,
        phoneNumber,
        email,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !user.smsCodeExpiresAt ||
      new Date(user.smsCodeExpiresAt) < new Date()
    ) {
      logger.warn("Reset password failed: code expired", {
        ip: req.ip,
        phoneNumber,
        email,
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = verifyField(smsCode, user.smsCode);
    if (!isSmsValid) {
      logger.warn("Reset password failed: invalid code", {
        ip: req.ip,
        phoneNumber,
        email,
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

    logger.info("Password reset successfully", {
      ip: req.ip,
      userId: user.id,
      phoneNumber,
      email,
    });

    return res.status(200).json({
      message: getResponseMessage("passwordChanged"),
      user: newUser,
    });
  } catch (error) {
    logCatchyError("Reset password exception", error, {
      ip: req.ip,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
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
    const oldRefreshToken = req.cookies.refreshToken;

    logger.info("token refresh attempt", {
      ip: req.ip,
    });

    if (!oldRefreshToken) {
      logger.warn("Refresh token failed: unauthorized", { ip: req.ip });
      return sendError(req, res, 401, "unauthorized");
    }

    let decoded;
    try {
      decoded = await verifyRefreshToken(oldRefreshToken);
    } catch {
      logger.warn("Refresh token failed: invalid token", { ip: req.ip });
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
    logger.info("Refresh token successfully renewed", {
      ip: req.ip,
      userId: decoded.id,
      phoneNumber: decoded.phoneNumber,
    });

    return res.status(200).json({
      message: getResponseMessage("tokenRefreshed"),
    });
  } catch (error) {
    logCatchyError("Refresh token exception", error, { ip: req.ip });

    return next(error);
  }
};
