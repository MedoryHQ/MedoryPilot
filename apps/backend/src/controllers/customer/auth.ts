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
} from "../../utils";
import { ICreatePendingUser } from "types/customer";
import bcrypt from "bcrypt";

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
    const { code, id, phoneNumber } = req.body as {
      code: string;
      id: string;
      phoneNumber: string;
    };

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

    const isSmsValid =
      pending.smsCode && (await bcrypt.compare(code, pending.smsCode));

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

    const { passwordHash, smsCode, ...userData } = user;

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
