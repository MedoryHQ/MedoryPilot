import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { EducationFormValues } from "@/validations/website/education.validation";
import { educationSubmitSchema } from "@/validations/website/education.validation";

export interface EducationFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: EducationFormValues = {
  fromDate: null,
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

  const mapFetchedToForm = buildMapper<EducationFormValues>({
    fileFields: ["icon"],
    copyFields: ["link"],
    dateFields: ["fromDate", "endDate"],
    translations: {
      fields: ["name", "degree", "description"]
    }
  });

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
          type: "link",
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
    <GenericEntityForm<EducationFormValues>
      resourceName="educations"
      mode={mode}
      id={id ?? undefined}
      schema={educationSubmitSchema(t, i18n.language as "en" | "ka")}
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
            placeholder: toUpperCase(t("educations.form.name")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "degree",
            label: toUpperCase(t("educations.form.degree")),
            placeholder: toUpperCase(t("educations.form.degree")),
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

export default EducationForm;
