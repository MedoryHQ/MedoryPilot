import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { PageComponentFormValues } from "@/validations/website/pageComponent.validation";
import { pageComponentSchema } from "@/validations/website/pageComponent.validation";

const defaultValues: PageComponentFormValues = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  metaImage: null,
  footerOrder: 0,
  slug: "",
  translations: {
    en: { name: "", content: "" },
    ka: { name: "", content: "" }
  }
};

export const PageComponentForm: React.FC<FormProps> = ({
  mode,
  slug = null,
  onSuccessNavigate = "/landing/page-components"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<PageComponentFormValues>({
    fileFields: ["metaImage"],
    copyFields: [
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "slug",
      "footerOrder"
    ],
    translations: {
      fields: ["content", "name"]
    }
  });

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/page-component/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: PageComponentFormValues) => {
    await axios.post("/page-component", payload);
  };

  const updateEntity = async (
    entityId: string,
    payload: PageComponentFormValues
  ) => {
    await axios.put(`/page-component/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/page-component/${entityId}`);
  };

  const rightSections = [
    {
      key: "settings",
      title: toUpperCase(t("pageComponents.form.settings")),
      description: undefined,
      fields: [
        {
          kind: "simple",
          name: "footerOrder",
          label: toUpperCase(t("pageComponents.form.footerOrder")),
          type: "number",
          props: {
            min: 0,
            max: 100,
            step: 1,
            placeholder: t("pageComponents.form.footerOrderPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "slug",
          label: toUpperCase(t("pageComponents.form.slug")),
          type: "text",
          props: {
            placeholder: t("pageComponents.form.slugPlaceholder"),
            fullWidth: true
          }
        }
      ] as FieldConfig<PageComponentFormValues>[]
    },
    {
      key: "metaInformation",
      title: toUpperCase(t("pageComponents.form.metaInformation")),
      fields: [
        {
          kind: "simple",
          name: "metaTitle",
          label: toUpperCase(t("pageComponents.form.metaTitleLabel")),
          type: "text",
          props: {
            placeholder: t("pageComponents.form.metaTitlePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaDescription",
          label: toUpperCase(t("pageComponents.form.metaDescriptionLabel")),
          type: "textarea",
          props: {
            placeholder: t("pageComponents.form.metaDescriptionPlaceholder"),
            rows: 5,
            maxLength: 500
          }
        },
        {
          kind: "simple",
          name: "metaKeywords",
          label: toUpperCase(t("pageComponents.form.metaKeywordsLabel")),
          type: "text",
          props: {
            placeholder: t("pageComponents.form.metaKeywordsPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaImage",
          label: toUpperCase(t("pageComponents.form.metaImageLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<PageComponentFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<PageComponentFormValues>
      resourceName="pageComponents"
      mode={mode}
      id={slug ?? undefined}
      schema={pageComponentSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("pageComponents.form.name")),
            placeholder: toUpperCase(t("pageComponents.form.name")),
            required: true,
            fullWidth: true,
            type: "text"
          },
          {
            name: "content",
            label: toUpperCase(t("pageComponents.form.content")),
            placeholder: toUpperCase(t("pageComponents.form.content")),
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

export default PageComponentForm;
