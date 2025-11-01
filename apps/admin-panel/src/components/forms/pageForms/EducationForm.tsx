import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { EducationFormValues } from "@/validations/website/education.validation";
import { educationSchema } from "@/validations/website/education.validation";

export interface EducationFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: EducationFormValues = {
  fromDate: new Date(),
  endDate: undefined,
  link: "",
  icon: null,
  translations: {
    en: { name: "", degree: "", description: "" },
    ka: { name: "", degree: "", description: "" }
  }
};

export const EducationForm: React.FC<EducationFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/educations"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<EducationFormValues> => {
    if (!entity) return {};
    const { link, fromDate, endDate } = entity;

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

    return {
      icon,
      ...(link ? { link } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      translations: {
        en: {
          name: en.name ?? "",
          degree: en.degree ?? "",
          description: en.description ?? ""
        },
        ka: {
          name: ka.name ?? "",
          degree: ka.degree ?? "",
          description: ka.description ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/education/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: EducationFormValues) => {
    await axios.post("/education", payload);
  };

  const updateEntity = async (
    entityId: string,
    payload: EducationFormValues
  ) => {
    await axios.put(`/education/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/education/${entityId}`);
  };

  const rightSections = [
    {
      key: "name",
      title: toUpperCase(t("educations.management")),
      fields: [
        {
          kind: "simple",
          name: "link",
          label: toUpperCase(t("educations.form.link")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("educations.form.link"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "fromDate",
          label: toUpperCase(t("educations.form.fromDate")),
          type: "date",
          props: {
            step: 1,
            placeholder: t("educations.form.fromDate"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "endDate",
          label: toUpperCase(t("educations.form.endDate")),
          type: "date",
          props: {
            step: 1,
            placeholder: t("educations.form.endDate"),
            fullWidth: true
          }
        }
      ] as FieldConfig<EducationFormValues>[]
    },
    {
      key: "icon",
      title: toUpperCase(t("educations.form.icon")),
      fields: [
        {
          kind: "simple",
          name: "icon",
          label: toUpperCase(t("educations.form.icon")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<EducationFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<EducationFormValues, any>
      resourceName="educations"
      mode={mode}
      id={id ?? undefined}
      schema={educationSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "name",
            label: toUpperCase(t("educations.form.name")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "degree",
            label: toUpperCase(t("educations.form.degree")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            type: "textarea",
            name: "description",
            label: toUpperCase(t("educations.form.description")),
            required: true,
            fullWidth: true,
            rows: 1
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

export default EducationForm;
