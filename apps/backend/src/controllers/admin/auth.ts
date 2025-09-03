import { prisma } from "@/config";
import {
  IAdminLogin,
  IForgotAdminPasswordVerification,
  IOtpCodeResend,
  IOtpVerification,
  IResetAdminPassword,
} from "@/types/admin/auth";
import { IForgetPasswordWithEmail } from "@/types/customer";
import {
  generateAccessToken,
  generateRefreshToken,
  sendError,
  verifyField,
  cookieOptions,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  inMinutes,
  getResponseMessage,
  generateSmsCode,
  createPassword,
  generateStageToken,
} from "@/utils";
import { NextFunction, Response, Request } from "express";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, remember } = req.body as IAdminLogin;

    logInfo("Login attempt", {
      ip: (req as any).hashedIp,
      path: req.path,
      event: "admin_login_attempt",
    });

    const user = await prisma.admin.findUnique({ where: { email } });

    if (!user || !(await verifyField(password, user.passwordHash))) {
      logWarn("Login failed: invalid credentials", {
        ip: (req as any).hashedIp,
        userId: user?.id,
        event: "admin_login_failed",
      });
      return sendError(req, res, 401, "invalidCredentials");
    }

    if (!user.twoFactorAuth) {
      const payload = { id: user.id, email: user.email };
      const access = generateAccessToken(payload, "ADMIN");
      const refresh = generateRefreshToken(payload, "ADMIN");

      res.cookie("accessToken", access.token, {
        ...cookieOptions,
        maxAge: remember ? refresh.expiresIn : undefined,
      });
      res.cookie("refreshToken", refresh.token, {
        ...cookieOptions,
        maxAge: remember ? refresh.expiresIn : undefined,
      });

      logInfo("Admin logged in successfully", {
        ip: (req as any).hashedIp,
        userId: user.id,
        event: "admin_verified",
      });

      return res.json({
        message: getResponseMessage("loginSuccessful"),
        data: { user: { email: user.email } },
      });
    }

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    await prisma.admin.update({
      where: { id: user.id },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });

    // await mailer.sendOtpCode(email, smsCode);

    logInfo("Admin login code sent", {
      ip: (req as any).hashedIp,
      userId: user.id,
      event: "admin_login_code_sent",
    });

    const stageToken = generateStageToken(user.id, remember);

    res.cookie("admin_verify_stage", stageToken.token, {
      ...cookieOptions,
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ message: getResponseMessage("codeSent") });
  } catch (error: unknown) {
    logCatchyError("Login exception", error, {
      ip: (req as any).hashedIp,
      event: "admin_login_exception",
    });
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body as IOtpVerification;

    const admin = await prisma.admin.findUnique({
      where: { id: (req as any).userId },
    });
    if (!admin) {
      logWarn("Admin verification failed: admin not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        event: "admin_verification_failed",
      });

      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !admin.smsCodeExpiresAt ||
      new Date(admin.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Admin verification failed: code expired", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        event: "admin_verification_failed",
      });

      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isValid = admin.smsCode
      ? await verifyField(code, admin.smsCode)
      : false;
    if (!isValid) {
      logWarn("Admin verification failed: code invalid", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        event: "admin_verification_failed",
      });

      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    res.clearCookie("admin_verify_stage");

    const remember = (req as any).remember;
    const payload = { id: admin.id, email: admin.email };
    const access = generateAccessToken(payload, "ADMIN");
    const refresh = generateRefreshToken(payload, "ADMIN");

    res.cookie("accessToken", access.token, {
      ...cookieOptions,
      maxAge: remember ? refresh.expiresIn : undefined,
    });

    res.cookie("refreshToken", refresh.token, {
      ...cookieOptions,
      maxAge: remember ? refresh.expiresIn : undefined,
    });

    logInfo("Admin verified successfully", {
      ip: (req as any).hashedIp,
      userId: admin.id,
      event: "admin_verified",
    });

    return res.json({
      message: getResponseMessage("loginSuccessful"),
      data: { user: { email: admin.email } },
    });
  } catch (error) {
    logCatchyError("Admin verify otp exception", error, {
      ip: (req as any).hashedIp,
      userId: req.user?.id,
      event: "admin_verify_otp_exception",
    });
    next(error);
  }
};

export const resendAdminVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as IOtpCodeResend;

    logInfo("Resend verification attempt", {
      ip: (req as any).hashedIp,
      event: "admin_resend_verification_attempt",
    });
    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      logWarn("OTP code resend failed: admin not found", {
        ip: (req as any).hashedIp,
        event: "admin_otp_code_resend_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (
      admin.smsCodeExpiresAt &&
      new Date(admin.smsCodeExpiresAt) > new Date()
    ) {
      logWarn("OTP code resend failed: code still valid", {
        ip: (req as any).hashedIp,
        event: "admin_otp_code_resend_failed",
      });
      return sendError(req, res, 400, "verificationCodeStillValid");
    }

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });

    // await mailer.sendOtpCode(email, smsCode);

    logInfo("Verification code resent successfully", {
      ip: (req as any).hashedIp,
      userId: admin.id,
      event: "admin_verification_code_resent",
    });

    return res.status(200).json({
      message: getResponseMessage("verificationCodeResent"),
    });
  } catch (error) {
    logCatchyError("Admin Resend verification exception", error, {
      ip: (req as any).hashedIp,
      event: "admin_resend_verification_exception",
    });

    return next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logInfo("Token renew attempt", {
      ip: (req as any).hashedIp,
      userId: req.user?.id,
    });

    const user = await prisma.admin.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });

    if (!user) {
      logWarn("Token renew failed: user not found", {
        ip: (req as any).hashedIp,
        userId: req.user?.id,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    logInfo("Token renew success", {
      ip: (req as any).hashedIp,
      userId: user.id,
    });

    return res.json({
      data: {
        user,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    logInfo("Token renew exception", {
      ip: (req as any).hashedIp,
      userId: req.user?.id,
    });
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as IForgetPasswordWithEmail;

    logInfo("Forget password attempt", {
      ip: (req as any).hashedIp,
      event: "admin_forgot_password_attempt",
    });

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      logWarn("Forgot password failed: admin not found", {
        ip: (req as any).hashedIp,
        event: "admin_forgot_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (
      admin.smsCodeExpiresAt &&
      new Date(admin.smsCodeExpiresAt) > new Date()
    ) {
      logWarn("Forgot password failed: code still valid", {
        ip: (req as any).hashedIp,
        event: "admin_forgot_password_failed",
      });
      return sendError(req, res, 400, "verificationCodeStillValid");
    }

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    // await mailer.sendOtpCode(email, smsCode);

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: inMinutes(5),
      },
    });

    logInfo("Forgot password code sent", {
      ip: (req as any).hashedIp,
      userId: admin.id,
      event: "admin_forgot_password_code_sent",
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    logCatchyError("Forgot password exception", error, {
      ip: (req as any).hashedIp,
      event: "admin_forgot_password_exception",
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
    const { smsCode, email } = req.body as IForgotAdminPasswordVerification;

    logInfo("Forget password verification attempt", {
      ip: (req as any).hashedIp,
      event: "admin_forgot_password_verification_attempt",
    });

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin || !admin.smsCode) {
      logWarn("Forgot password verification failed: admin not found", {
        ip: (req as any).hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !admin.smsCodeExpiresAt ||
      new Date(admin.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Forgot password verification failed: code expired", {
        ip: (req as any).hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = await verifyField(smsCode, admin.smsCode);
    if (!isSmsValid) {
      logWarn("Forgot password verification failed: invalid code", {
        ip: (req as any).hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    logInfo("Forgot password code verified successfully", {
      ip: (req as any).hashedIp,
      userId: admin.id,
      event: "admin_forgot_password_code_verified",
    });
    return res.status(200).json({
      message: getResponseMessage("codeVerified"),
    });
  } catch (error) {
    logCatchyError("Forgot password verification exception", error, {
      ip: (req as any).hashedIp,
      event: "admin_forgot_password_verification_exception",
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
    const { email, password, smsCode } = req.body as IResetAdminPassword;

    logInfo("Reset password attempt", {
      ip: (req as any).hashedIp,
      event: "admin_reset_password_attempt",
    });

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.smsCode) {
      logWarn("Reset password failed: admin not found or no code", {
        ip: (req as any).hashedIp,
        event: "admin_reset_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !admin.smsCodeExpiresAt ||
      new Date(admin.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Reset password failed: code expired", {
        ip: (req as any).hashedIp,
        event: "admin_reset_password_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = await verifyField(smsCode, admin.smsCode);
    if (!isSmsValid) {
      logWarn("Reset password failed: invalid code", {
        ip: (req as any).hashedIp,
        event: "admin_reset_password_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    const passwordHash = await createPassword(password);

    const newAdmin = await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash,
        smsCode: null,
      },
    });

    logInfo("Password reset successfully", {
      ip: (req as any).hashedIp,
      userId: admin.id,
      event: "admin_password_reset",
    });
    return res.status(200).json({
      message: getResponseMessage("passwordChanged"),
      admin: newAdmin,
    });
  } catch (error) {
    logCatchyError("Reset password exception", error, {
      ip: (req as any).hashedIp,
      event: "admin_reset_password_exception",
    });

    next(error);
  }
};
