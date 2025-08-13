import { prisma } from "../../config";
import { NextFunction, Request, Response } from "express";
import {
  calculateAge,
  createPassword,
  generateSmsCode,
  getResponseMessage,
  sendError,
} from "../../utils";
import { ICreatePendingUser } from "types/customer";

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
    const fullName = firstName.concat(" ", lastName);
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
