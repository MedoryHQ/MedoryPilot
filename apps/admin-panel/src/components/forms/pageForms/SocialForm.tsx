import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { SocialFormValues } from "@/validations/website/social.validation.ts";
import { socialSchema } from "@/validations/website/social.validation.ts";
import { Social } from "@/types/website";

const defaultValues: SocialFormValues = {
  icon: null,
  name: "",
  url: ""
};

export const SocialForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/socials"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: Social): Partial<SocialFormValues> => {
    if (!entity) return {};
    const icon = entity.icon
      ? {
          path: entity.icon.path ?? "",
          name: entity.icon.name ?? "",
          size: entity.icon.size ?? undefined
        }
      : null;
    return {
      icon,
      name: entity.name,
      url: entity.url
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/social/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: SocialFormValues) => {
    await axios.post("/social", payload);
  };

  const updateEntity = async (entityId: string, payload: SocialFormValues) => {
    await axios.put(`/social/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/social/${entityId}`);
  };

  const leftSections = [
    {
      key: "name",
      title: toUpperCase(t("socials.management")),
      fields: [
        {
          kind: "simple",
          name: "name",
          label: toUpperCase(t("socials.form.name")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("socials.form.namePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "url",
          label: toUpperCase(t("socials.form.url")),
          type: "link",
          props: {
            step: 1,
            placeholder: t("socials.form.urlPlaceholder"),
            fullWidth: true
          }
        }
      ] as FieldConfig<SocialFormValues>[]
    }
  ];

  const rightSections = [
    {
      key: "icon",
      title: toUpperCase(t("socials.form.icon")),
      fields: [
        {
          kind: "simple",
          name: "icon",
          label: toUpperCase(t("socials.form.iconLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<SocialFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<SocialFormValues>
      resourceName="socials"
      mode={mode}
      id={id ?? undefined}
      schema={socialSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      sections={{ left: leftSections, right: rightSections }}
      onSuccessNavigate={onSuccessNavigate}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
    />
  );
};

export default SocialForm;
