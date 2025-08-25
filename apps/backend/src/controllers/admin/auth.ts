import { prisma } from "@/config";
import {
  IAdminLogin,
  IForgotAdminPasswordVerification,
  IResetAdminPassword,
} from "@/types/admin/auth";
import { IForgetPasswordWithEmail } from "@/types/customer";
import {
  sendError,
  verifyField,
  cookieOptions,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  getClientIp,
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
    const hashedIp = await getClientIp(req);
    const { email, password, remember } = req.body as IAdminLogin;

    logInfo("Login attempt", {
      ip: hashedIp,
      path: req.path,
      method: req.method,
    });

    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      logWarn("Login failed: user not found", { ip: hashedIp, path: req.path });
      return sendError(req, res, 404, "userNotFound");
    }

    const validPassword = await verifyField(password, user.passwordHash);
    if (!validPassword) {
      logWarn("Login failed: invalid password", {
        ip: hashedIp,
        userId: user.id,
      });
      return sendError(req, res, 401, "invalidCredentials");
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
      ip: hashedIp,
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
    const hashedIp = await getClientIp(req);
    logCatchyError("Login exception", error, {
      ip: hashedIp,
    });
    next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    logInfo("Token renew attempt", { ip: hashedIp, userId: req.user?.id });

    const user = await prisma.admin.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });

    if (!user) {
      logWarn("Token renew failed: user not found", {
        ip: hashedIp,
        userId: req.user?.id,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    logInfo("Token renew success", { ip: hashedIp, userId: user.id });

    return res.json({
      data: {
        user,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logInfo("Token renew exception", { ip: hashedIp, userId: req.user?.id });
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { email } = req.body as IForgetPasswordWithEmail;

    logInfo("Forget password attempt", {
      ip: hashedIp,
      event: "admin_forgot_password_attempt",
    });

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      logWarn("Forgot password failed: admin not found", {
        ip: hashedIp,
        event: "admin_forgot_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }
    if (
      admin.smsCodeExpiresAt &&
      new Date(admin.smsCodeExpiresAt) > new Date()
    ) {
      logWarn("Forgot password failed: code still valid", {
        ip: hashedIp,
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
      ip: hashedIp,
      userId: admin.id,
      event: "admin_forgot_password_code_sent",
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Forgot password exception", error, {
      ip: hashedIp,
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
    const hashedIp = await getClientIp(req);
    const { smsCode, email } = req.body as IForgotAdminPasswordVerification;

    logInfo("Forget password verification attempt", {
      ip: hashedIp,
      event: "admin_forgot_password_verification_attempt",
    });

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin || !admin.smsCode) {
      logWarn("Forgot password verification failed: admin not found", {
        ip: hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !admin.smsCodeExpiresAt ||
      new Date(admin.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Forgot password verification failed: code expired", {
        ip: hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = await verifyField(smsCode, admin.smsCode);
    if (!isSmsValid) {
      logWarn("Forgot password verification failed: invalid code", {
        ip: hashedIp,
        event: "admin_forgot_password_verification_failed",
      });
      return sendError(req, res, 401, "smsCodeisInvalid");
    }

    logInfo("Forgot password code verified successfully", {
      ip: hashedIp,
      userId: admin.id,
      event: "admin_forgot_password_code_verified",
    });
    return res.status(200).json({
      message: getResponseMessage("codeVerified"),
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Forgot password verification exception", error, {
      ip: hashedIp,
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
    const hashedIp = await getClientIp(req);
    const { email, password, smsCode } = req.body as IResetAdminPassword;

    logInfo("Reset password attempt", {
      ip: hashedIp,
      event: "admin_reset_password_attempt",
    });

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.smsCode) {
      logWarn("Reset password failed: admin not found or no code", {
        ip: hashedIp,
        event: "admin_reset_password_failed",
      });
      return sendError(req, res, 404, "userNotFound");
    }

    if (
      !admin.smsCodeExpiresAt ||
      new Date(admin.smsCodeExpiresAt) < new Date()
    ) {
      logWarn("Reset password failed: code expired", {
        ip: hashedIp,
        event: "admin_reset_password_failed",
      });
      return sendError(req, res, 400, "verificationCodeExpired");
    }

    const isSmsValid = await verifyField(smsCode, admin.smsCode);
    if (!isSmsValid) {
      logWarn("Reset password failed: invalid code", {
        ip: hashedIp,
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
      ip: hashedIp,
      userId: admin.id,
      event: "admin_password_reset",
    });
    return res.status(200).json({
      message: getResponseMessage("passwordChanged"),
      admin: newAdmin,
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Reset password exception", error, {
      ip: hashedIp,
      event: "admin_reset_password_exception",
    });

    next(error);
  }
};
