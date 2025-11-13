import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { ServiceFormValues } from "@/validations/website/service.validation";
import { serviceSchema } from "@/validations/website/service.validation";

const defaultValues: ServiceFormValues = {
  icon: null,
  translations: {
    en: { title: "", description: "" },
    ka: { title: "", description: "" }
  }
};

export const ServiceForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/services"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<ServiceFormValues>({
    fileFields: ["icon"],
    translations: {
      fields: ["title", "description"]
    }
  });

  const fetchEntity = async (entityId?: string) => {
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
    }
  ];

  return (
    <GenericEntityForm<ServiceFormValues>
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
            placeholder: toUpperCase(t("services.form.title")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "description",
            label: toUpperCase(t("services.form.description")),
            placeholder: toUpperCase(t("services.form.description")),
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
