import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { ServiceFormValues } from "@/validations/website/service.validation";
import { serviceSchema } from "@/validations/website/service.validation";

export interface ServiceFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: ServiceFormValues = {
  icon: null,
  background: null,
  translations: {
    en: { title: "", description: "" },
    ka: { title: "", description: "" }
  }
};

export const ServiceForm: React.FC<ServiceFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/services"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<ServiceFormValues> => {
    if (!entity) return {};
    const translations = entity.translations ?? [];
    const en = translations.find((tr: any) => tr.language?.code === "en") ?? {};
    const ka = translations.find((tr: any) => tr.language?.code === "ka") ?? {};

    const icon = entity.icon
      ? {
          path: entity.icon.path ?? entity.icon.url ?? "",
          name: entity.icon.name ?? "",
          size: entity.icon.size ?? undefined
        }
      : null;

    const background = entity.background
      ? {
          path: entity.background.path ?? entity.background.url ?? "",
          name: entity.background.name ?? "",
          size: entity.background.size ?? undefined
        }
      : null;

    return {
      icon,
      background,
      translations: {
        en: {
          title: en.title ?? "",
          description: en.description ?? ""
        },
        ka: {
          title: ka.title ?? "",
          description: ka.description ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId: string) => {
    const res = await axios.get(`/service/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: ServiceFormValues) => {
    await axios.post("/service", payload);
  };

  const updateEntity = async (entityId: string, payload: ServiceFormValues) => {
    await axios.put(`/service/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/service/${entityId}`);
  };

  const rightSections = [
    {
      key: "icon",
      title: toUpperCase(t("services.form.icon")),
      fields: [
        {
          kind: "simple",
          name: "icon",
          label: toUpperCase(t("services.form.iconLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<ServiceFormValues>[]
    },
    {
      key: "background",
      title: toUpperCase(t("services.form.background")),
      fields: [
        {
          kind: "simple",
          name: "background",
          label: toUpperCase(t("services.form.backgroundLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<ServiceFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<ServiceFormValues, any>
      resourceName="services"
      mode={mode}
      id={id ?? undefined}
      schema={serviceSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "title",
            label: toUpperCase(t("services.form.title")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "description",
            label: toUpperCase(t("services.form.description")),
            type: "textarea",
            rows: 5,
            maxLength: 500
          }
        ] as const
      }
      sections={{ left: [], right: rightSections }}
      onSuccessNavigate={onSuccessNavigate}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
    />
  );
};

export default ServiceForm;
