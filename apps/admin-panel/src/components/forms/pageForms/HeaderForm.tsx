import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { HeaderFormValues } from "@/validations/website/header.validation";
import { headerSchema } from "@/validations/website/header.validation";

const defaultValues: HeaderFormValues = {
  logo: null,
  active: false,
  translations: {
    en: { name: "", position: "", headline: "", description: "" },
    ka: { name: "", position: "", headline: "", description: "" }
  }
};

export const HeaderForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/headers"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<HeaderFormValues>({
    fileFields: ["logo"],
    copyFields: ["active", "experience", "visits"],
    translations: {
      fields: ["name", "position", "headline", "description"]
    }
  });
  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/header/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: HeaderFormValues) => {
    await axios.post("/header", payload);
  };

  const updateEntity = async (entityId: string, payload: HeaderFormValues) => {
    await axios.put(`/header/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/header/${entityId}`);
  };

  const rightSections = [
    {
      key: "settings",
      title: toUpperCase(t("headers.form.settings")),
      description: undefined,
      fields: [
        {
          kind: "simple",
          name: "active",
          label: "headers.form.status",
          description: "headers.form.statusDescription",
          type: "toggle"
        },
        {
          kind: "simple",
          name: "experience",
          label: toUpperCase(t("headers.form.experience")),
          type: "number",
          props: {
            min: 1,
            max: 100,
            step: 1,
            placeholder: t("headers.form.experience"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "visits",
          label: toUpperCase(t("headers.form.visits")),
          type: "number",
          props: {
            min: 1,
            max: 100,
            step: 1,
            placeholder: t("headers.form.visits"),
            fullWidth: true
          }
        }
      ] as FieldConfig<HeaderFormValues>[]
    },
    {
      key: "logo",
      title: toUpperCase(t("headers.form.logo")),
      fields: [
        {
          kind: "simple",
          name: "logo",
          label: toUpperCase(t("headers.form.logoLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<HeaderFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<HeaderFormValues>
      resourceName="headers"
      mode={mode}
      id={id ?? undefined}
      schema={headerSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("headers.form.name")),
            placeholder: toUpperCase(t("headers.form.name")),
            required: true
          },
          {
            name: "position",
            label: toUpperCase(t("headers.form.position")),
            placeholder: toUpperCase(t("headers.form.position")),
            required: true
          },
          {
            name: "headline",
            label: toUpperCase(t("headers.form.headline")),
            placeholder: toUpperCase(t("headers.form.headline")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("headers.form.description")),
            placeholder: toUpperCase(t("headers.form.description")),
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

export default HeaderForm;
