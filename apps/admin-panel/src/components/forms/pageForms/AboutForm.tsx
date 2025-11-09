import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { AboutFormValues } from "@/validations/website/about.validation.ts";
import { aboutSchema } from "@/validations/website/about.validation.ts";
import { FieldConfig, FormProps } from "@/types";

const defaultValues: AboutFormValues = {
  image: null,
  translations: {
    en: { headline: "", description: "" },
    ka: { headline: "", description: "" }
  }
};

export const AboutForm: React.FC<FormProps> = ({
  mode,
  id = null,
  entityData,
  refetch
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = buildMapper<AboutFormValues>({
    fileFields: ["image"],
    translations: {
      locales: ["en", "ka"],
      fields: ["headline", "description"]
    }
  });

  const fetchEntity = async () => {
    const res = await axios.get("/about");
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: AboutFormValues) => {
    await axios.post("/about", payload);
  };

  const updateEntity = async (entityId: string, payload: AboutFormValues) => {
    await axios.put(`/about/${entityId}`, payload);
  };

  const deleteEntity = async () => {
    await axios.delete("/about");
  };

  const rightSections = [
    {
      key: "image",
      title: toUpperCase(t("about.form.image")),
      fields: [
        {
          kind: "simple",
          name: "image",
          label: toUpperCase(t("about.form.imageLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<AboutFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<AboutFormValues>
      resourceName="about"
      mode={mode}
      id={id ?? undefined}
      schema={aboutSchema(t)}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      onDeleteSuccess={() => refetch?.()}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "headline",
            label: toUpperCase(t("about.form.headline")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("about.form.description")),
            type: "markdown",
            required: true,
            fullWidth: true
          }
        ] as const
      }
      sections={{ left: [], right: rightSections }}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
      entityData={entityData}
      refetch={refetch}
      allowModeToggleForReadonly
    />
  );
};

export default AboutForm;
