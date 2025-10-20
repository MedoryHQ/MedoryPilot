import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { NewsFormValues } from "@/validations/website/news.validation";
import { newsSchema } from "@/validations/website/news.validation";

export interface NewsFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: NewsFormValues = {
  background: null,
  showInLanding: false,
  order: null,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  metaImage: "",
  slug: "",
  translations: {
    en: { content: "" },
    ka: { content: "" }
  }
};

export const NewsForm: React.FC<NewsFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/newses"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<NewsFormValues> => {
    if (!entity) return {};
    const {
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImage,
      background,
      slug,
      translations,
      showInLanding,
      order
    } = entity;
    const en =
      translations?.find((tr: any) => tr?.language?.code === "en") ?? {};
    const ka =
      translations?.find((tr: any) => tr?.language?.code === "ka") ?? {};

    const formBackground = background
      ? {
          path: background.path ?? background.url ?? "",
          name: background.name ?? "",
          size: background.size ?? undefined
        }
      : null;

    return {
      background: formBackground,
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImage,
      slug,
      showInLanding,
      order,
      translations: {
        en: {
          content: en.content ?? ""
        },
        ka: {
          content: ka.content ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/news/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: NewsFormValues) => {
    await axios.post("/news", payload);
  };

  const updateEntity = async (entityId: string, payload: NewsFormValues) => {
    await axios.put(`/news/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/news/${entityId}`);
  };

  const rightSections = [
    {
      key: "settings",
      title: toUpperCase(t("newses.form.settings")),
      description: undefined,
      fields: [
        {
          kind: "simple",
          name: "showInLanding",
          label: "newses.form.showInLanding",
          description: "newses.form.showInLandingDescription",
          type: "toggle"
        },
        {
          kind: "simple",
          name: "order",
          label: toUpperCase(t("faqs.form.order")),
          type: "number",
          props: {
            min: 0,
            max: 100,
            step: 1,
            placeholder: t("faqs.form.orderPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "slug",
          label: toUpperCase(t("faqs.form.slug")),
          type: "text",
          props: {
            placeholder: t("faqs.form.slugPlaceholder"),
            fullWidth: true
          }
        }
      ] as FieldConfig<NewsFormValues>[]
    },
    {
      key: "background",
      title: toUpperCase(t("newses.form.background")),
      fields: [
        {
          kind: "simple",
          name: "background",
          label: toUpperCase(t("newses.form.backgroundLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<NewsFormValues>[]
    },
    {
      key: "metaInformation",
      title: toUpperCase(t("newses.form.metaInformation")),
      fields: [
        {
          kind: "simple",
          name: "metaTitle",
          label: toUpperCase(t("newses.form.metaTitleLabel")),
          type: "text",
          props: {
            placeholder: t("newses.form.metaTitlePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaDescription",
          label: toUpperCase(t("newses.form.metaDescriptionLabel")),
          type: "textarea",
          props: {
            placeholder: t("newses.form.metaDescriptionPlaceholder"),
            rows: 5,
            maxLength: 500
          }
        },
        {
          kind: "simple",
          name: "metaKeywords",
          label: toUpperCase(t("newses.form.metaKeywordsLabel")),
          type: "text",
          props: {
            placeholder: t("newses.form.metaKeywordsPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaImage",
          label: toUpperCase(t("newses.form.metaImageLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<NewsFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<NewsFormValues, any>
      resourceName="newses"
      mode={mode}
      id={id ?? undefined}
      schema={newsSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "content",
            label: toUpperCase(t("newses.form.content")),
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

export default NewsForm;
