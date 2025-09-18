import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { CreateContactDTO, UpdateContactDTO } from "@/types/admin";
import { Prisma } from "@prisma/client";

export const fetchContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await prisma.contact.findFirst({
      include: {
        background: true,
        translations: {
          include: {
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      logWarn("Contact fetch failed: contact not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "contact_fetch_failed",
      });
      return sendError(req, res, 404, "contactNotFound");
    }

    return res.status(200).json({ data: contact });
  } catch (error) {
    logCatchyError("fetch_contact_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_contact_exception",
    });
    next(error);
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Contact delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_delete_attempt",
    });

    const contact = await prisma.contact.deleteMany();

    if (!contact.count) {
      logWarn("Contact delete failed: contact not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "contact_delete_failed",
      });
      return sendError(req, res, 404, "contactNotFound");
    }

    logInfo("Contact deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("contactDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_contact_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_contact_exception",
    });
    next(error);
  }
};

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, background, location } = req.body as CreateContactDTO;

    logInfo("Contact create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ContactTranslationCreateWithoutContactInput[]
    >()(createTranslations(translations) as any);

    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const contact = await prisma.contact.create({
      data: {
        ...(location ? { location } : {}),
        translations: { create: translationsToCreate },
        background: {
          create: backgroundToCreate,
        },
      },
    });

    logInfo("Contact created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_created",
    });

    return res.status(201).json({
      data: contact,
    });
  } catch (error) {
    logCatchyError("create_contacts_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_contacts_exception",
    });
    next(error);
  }
};

export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, background, location } = req.body as UpdateContactDTO;

    logInfo("Contact update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ContactTranslationCreateWithoutContactInput[]
    >()(createTranslations(translations) as any);
    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const findContact = await prisma.contact.findUnique({
      where: {
        id,
      },
      include: {
        background: true,
      },
    });

    if (!findContact) {
      logWarn("Contact update failed: contact not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "contact_update_failed",
      });
      return sendError(req, res, 404, "contactNotFound");
    }

    const contact = await prisma.contact.update({
      where: {
        id,
      },
      data: {
        ...(location ? { location } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        background: backgroundToCreate
          ? {
              delete: findContact.background ? {} : undefined,
              create: backgroundToCreate,
            }
          : findContact.background
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("Contact updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_updated",
    });

    return res.json({
      data: contact,
    });
  } catch (error) {
    logCatchyError("update_contacts_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_contacts_exception",
    });
    next(error);
  }
};
