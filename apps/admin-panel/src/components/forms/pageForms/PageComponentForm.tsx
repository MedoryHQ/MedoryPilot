import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { PageComponentFormValues } from "@/validations/website/pageComponent.validation";
import { pageComponentSchema } from "@/validations/website/pageComponent.validation";

export interface PageComponentFormProps {
  mode: "create" | "edit" | "readonly";
  slug?: string | null;
  onSuccessNavigate?: string;
}

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

export const PageComponentForm: React.FC<PageComponentFormProps> = ({
  mode,
  slug = null,
  onSuccessNavigate = "/landing/page-components"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<PageComponentFormValues> => {
    if (!entity) return {};
    const {
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImage,
      slug,
      translations,
      footerOrder
    } = entity;
    const en =
      translations?.find((tr: any) => tr?.language?.code === "en") ?? {};
    const ka =
      translations?.find((tr: any) => tr?.language?.code === "ka") ?? {};

    const formMetaImage = metaImage
      ? {
          path: metaImage.path ?? metaImage.url ?? "",
          name: metaImage.name ?? "",
          size: metaImage.size ?? undefined
        }
      : null;

    return {
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImage: formMetaImage,
      slug,
      footerOrder,
      translations: {
        en: {
          content: en.content ?? "",
          name: en.name ?? ""
        },
        ka: {
          content: ka.content ?? "",
          name: ka.name ?? ""
        }
      }
    };
  };

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
    <GenericEntityForm<PageComponentFormValues, any>
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
            required: true,
            fullWidth: true,
            type: "text"
          },
          {
            name: "content",
            label: toUpperCase(t("pageComponents.form.content")),
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
