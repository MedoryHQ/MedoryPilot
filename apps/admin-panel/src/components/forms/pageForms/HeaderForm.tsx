import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { HeaderFormValues } from "@/validations/website/header.validation";
import { headerSchema } from "@/validations/website/header.validation";

export interface HeaderFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: HeaderFormValues = {
  logo: null,
  active: false,
  translations: {
    en: { name: "", position: "", headline: "", description: "" },
    ka: { name: "", position: "", headline: "", description: "" }
  }
};

export const HeaderForm: React.FC<HeaderFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/headers"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<HeaderFormValues> => {
    if (!entity) return {};
    const translations = entity.translations ?? [];
    const en = translations.find((tr: any) => tr.language?.code === "en") ?? {};
    const ka = translations.find((tr: any) => tr.language?.code === "ka") ?? {};

    const logo = entity.logo
      ? {
          path: entity.logo.path ?? entity.logo.url ?? "",
          name: entity.logo.name ?? "",
          size: entity.logo.size ?? undefined
        }
      : null;

    return {
      logo,
      active: !!entity.active,
      translations: {
        en: {
          name: en.name ?? "",
          position: en.position ?? "",
          headline: en.headline ?? "",
          description: en.description ?? ""
        },
        ka: {
          name: ka.name ?? "",
          position: ka.position ?? "",
          headline: ka.headline ?? "",
          description: ka.description ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId: string) => {
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
          type: "status"
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
    <GenericEntityForm<HeaderFormValues, any>
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
            required: true
          },
          {
            name: "position",
            label: toUpperCase(t("headers.form.position")),
            required: true
          },
          {
            name: "headline",
            label: toUpperCase(t("headers.form.headline")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("headers.form.description")),
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
