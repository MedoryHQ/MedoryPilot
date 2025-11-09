import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { ExperienceFormValues } from "@/validations/website/experience.validation";
import { experienceSubmitSchema } from "@/validations/website/experience.validation";
import { Experience } from "@/types/website";

export interface ExperienceFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: ExperienceFormValues = {
  fromDate: null,
  endDate: undefined,
  link: "",
  icon: null,
  location: "",
  translations: {
    en: { name: "", position: "", description: "" },
    ka: { name: "", position: "", description: "" }
  }
};

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/experiences"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (
    entity: Experience
  ): Partial<ExperienceFormValues> => {
    if (!entity) return {};
    const { link, fromDate, endDate, location } = entity;

    const translations = entity.translations ?? [];
    const en = translations.find((tr) => tr.language?.code === "en");
    const ka = translations.find((tr) => tr.language?.code === "ka");

    const icon = entity.icon
      ? {
          path: entity.icon.path ?? "",
          name: entity.icon.name ?? "",
          size: entity.icon.size ?? undefined
        }
      : null;

    return {
      icon,
      ...(link ? { link } : {}),
      ...(location ? { location } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      translations: {
        en: {
          name: en?.name ?? "",
          position: en?.position ?? "",
          description: en?.description ?? ""
        },
        ka: {
          name: ka?.name ?? "",
          position: ka?.position ?? "",
          description: ka?.description ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/experience/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: ExperienceFormValues) => {
    await axios.post("/experience", payload);
  };

  const updateEntity = async (
    entityId: string,
    payload: ExperienceFormValues
  ) => {
    await axios.put(`/experience/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/experience/${entityId}`);
  };

  const rightSections = [
    {
      key: "name",
      title: toUpperCase(t("experiences.management")),
      fields: [
        {
          kind: "simple",
          name: "link",
          label: toUpperCase(t("experiences.form.link")),
          type: "link",
          props: {
            step: 1,
            placeholder: t("experiences.form.link"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "location",
          label: toUpperCase(t("experiences.form.location")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("experiences.form.location"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "fromDate",
          label: toUpperCase(t("experiences.form.fromDate")),
          type: "date",
          props: {
            step: 1,
            placeholder: t("experiences.form.fromDate"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "endDate",
          label: toUpperCase(t("experiences.form.endDate")),
          type: "date",
          props: {
            step: 1,
            placeholder: t("experiences.form.endDate"),
            fullWidth: true
          }
        }
      ] as FieldConfig<ExperienceFormValues>[]
    },
    {
      key: "icon",
      title: toUpperCase(t("experiences.form.icon")),
      fields: [
        {
          kind: "simple",
          name: "icon",
          label: toUpperCase(t("experiences.form.icon")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<ExperienceFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<ExperienceFormValues>
      resourceName="experiences"
      mode={mode}
      id={id ?? undefined}
      schema={experienceSubmitSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("experiences.form.name")),
            placeholder: toUpperCase(t("experiences.form.name")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "position",
            label: toUpperCase(t("experiences.form.position")),
            placeholder: toUpperCase(t("experiences.form.position")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "description",
            label: toUpperCase(t("experiences.form.description")),
            placeholder: toUpperCase(t("experiences.form.description")),
            required: true,
            fullWidth: true,
            type: "markdown"
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

export default ExperienceForm;
