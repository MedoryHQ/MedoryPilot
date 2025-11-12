import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { HeroFormValues } from "@/validations/website/hero.validation";
import { heroSchema } from "@/validations/website/hero.validation";

const defaultValues: HeroFormValues = {
  logo: null,
  active: false,
  translations: {
    en: { name: "", position: "", headline: "", description: "" },
    ka: { name: "", position: "", headline: "", description: "" }
  }
};

export const HeroForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/heros"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<HeroFormValues>({
    fileFields: ["logo"],
    copyFields: ["active", "experience", "visits"],
    translations: {
      fields: ["name", "position", "headline", "description"]
    }
  });
  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/hero/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: HeroFormValues) => {
    await axios.post("/hero", payload);
  };

  const updateEntity = async (entityId: string, payload: HeroFormValues) => {
    await axios.put(`/hero/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/hero/${entityId}`);
  };

  const rightSections = [
    {
      key: "settings",
      title: toUpperCase(t("heros.form.settings")),
      description: undefined,
      fields: [
        {
          kind: "simple",
          name: "active",
          label: "heros.form.status",
          description: "heros.form.statusDescription",
          type: "toggle"
        },
        {
          kind: "simple",
          name: "experience",
          label: toUpperCase(t("heros.form.experience")),
          type: "number",
          props: {
            min: 1,
            max: 100,
            step: 1,
            placeholder: t("heros.form.experience"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "visits",
          label: toUpperCase(t("heros.form.visits")),
          type: "number",
          props: {
            min: 1,
            max: 100,
            step: 1,
            placeholder: t("heros.form.visits"),
            fullWidth: true
          }
        }
      ] as FieldConfig<HeroFormValues>[]
    },
    {
      key: "logo",
      title: toUpperCase(t("heros.form.logo")),
      fields: [
        {
          kind: "simple",
          name: "logo",
          label: toUpperCase(t("heros.form.logoLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<HeroFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<HeroFormValues>
      resourceName="heros"
      mode={mode}
      id={id ?? undefined}
      schema={heroSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("heros.form.name")),
            placeholder: toUpperCase(t("heros.form.name")),
            required: true
          },
          {
            name: "position",
            label: toUpperCase(t("heros.form.position")),
            placeholder: toUpperCase(t("heros.form.position")),
            required: true
          },
          {
            name: "headline",
            label: toUpperCase(t("heros.form.headline")),
            placeholder: toUpperCase(t("heros.form.headline")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("heros.form.description")),
            placeholder: toUpperCase(t("heros.form.description")),
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

export default HeroForm;
