import { prisma } from "../../config";
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
} from "../../utils";
import {
  ICreatePendingUser,
  IForgotPassword,
  IForgotPasswordVerification,
  IResendUserVerificationCode,
  IUserLogin,
  IUserVerify,
} from "../../types/customer";

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

    const {
      hashedSmsCode,
      // smsCode
    } = await generateSmsCode();

    const existingUser = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser) {
      return sendError(res, 409, "phoneAlreadyExists");
    }

    const passwordHash = await createPassword(password);
    const fullName = `${firstName} ${lastName}`;
    const age = calculateAge(dateOfBirth);

    if (age === null || age === undefined) {
      return sendError(res, 400, "invalidDateOfBirth");
    }

    const newPendingUser = await prisma.pendingUser.create({
      data: {
        phoneNumber,
        passwordHash,
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
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

    // if (!smsResponse.success) return sendError(res, 500, "smsSendFaild")

    return res.status(200).json({
      message: getResponseMessage("smsVerificationSent"),
      data: {
        id: newPendingUser.id,
        phoneNumber: newPendingUser.phoneNumber,
      },
    });
  } catch (error) {
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

    const pending = await prisma.pendingUser.findUnique({
      where: {
        id,
        phoneNumber,
      },
    });

    if (!pending) return sendError(res, 404, "userNotFound");

    if (new Date(pending?.smsCodeExpiresAt) < new Date()) {
      return sendError(res, 400, "verificationCodeExpired");
    }

    const isSmsValid = pending.smsCode && verifyField(code, pending.smsCode);

    if (!isSmsValid) {
      return sendError(res, 401, "smsCodeisInvalid");
    }
    const fullName = `${pending.firstName} ${pending.lastName}`;
    const age = calculateAge(pending.dateOfBirth);

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

    return res.status(200).json({
      message: getResponseMessage("verificationSuccessful"),
      data: {
        ...userData,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
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

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!user) return sendError(res, 404, "userNotFound");

    const isPasswordValid = verifyField(password, user.passwordHash);

    if (!isPasswordValid) {
      return sendError(res, 400, "invalidPassword");
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

    return res.status(200).json({
      message: getResponseMessage("loginSuccessful"),
      data: {
        user: {
          ...userData,
        },
      },
    });
  } catch (error) {
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

    const user = await prisma.pendingUser.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) return sendError(res, 404, "userNotFound");

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
        smsCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // const smsResponse = await sendSMS(
    //   phoneNumber,
    //   `Verification Code: ${smsCode}`
    // );

    // if (!smsResponse.success) return sendError(res, 500, "smsSendFaild")

    return res.status(200).json({
      message: getResponseMessage("verificationCodeResent"),
    });
  } catch (error) {
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

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) return sendError(res, 404, "userNotFound");

    const {
      hashedSmsCode,
      //  smsCode
    } = await generateSmsCode();

    // const smsResponse = await sendSMS(
    //   phoneNumber,
    //   `Verification Code: ${smsCode}, please enter code for reset.`
    // );

    // if (!smsResponse.success) return sendError(res, 500, "smsSendFaild")

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        smsCode: hashedSmsCode,
        smsCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message: getResponseMessage("codeSent"),
    });
  } catch (error) {
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

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user || !user.smsCode) return sendError(res, 404, "userNotFound");

    const isSmsValid = verifyField(smsCode, user.smsCode);

    if (!isSmsValid) {
      return sendError(res, 401, "smsCodeisInvalid");
    }

    return res.status(200).json({
      message: getResponseMessage("codeVerified"),
    });
  } catch (error) {
    next(error);
  }
};
