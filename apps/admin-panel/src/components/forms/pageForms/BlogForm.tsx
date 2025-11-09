import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { BlogFormValues } from "@/validations/website/blog.validation";
import { blogSchema } from "@/validations/website/blog.validation";

const defaultValues: BlogFormValues = {
  background: null,
  showInLanding: false,
  categories: [],
  landingOrder: 0,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  metaImage: null,
  slug: "",
  translations: {
    en: { title: "", content: "" },
    ka: { title: "", content: "" }
  }
};

export const BlogForm: React.FC<FormProps> = ({
  mode,
  slug = null,
  onSuccessNavigate = "/landing/blogs"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<BlogFormValues>({
    fileFields: ["background", "metaImage"],
    copyFields: [
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "slug",
      "showInLanding",
      "landingOrder"
    ],
    listToIds: ["categories"],
    translations: {
      fields: ["content", "title"]
    }
  });

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/blog/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: BlogFormValues) => {
    await axios.post("/blog", payload);
  };

  const updateEntity = async (entityId: string, payload: BlogFormValues) => {
    await axios.put(`/blog/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/blog/${entityId}`);
  };

  const rightSections = [
    {
      key: "settings",
      title: toUpperCase(t("blogs.form.settings")),
      description: undefined,
      fields: [
        {
          kind: "simple",
          name: "showInLanding",
          label: "blogs.form.showInLanding",
          description: "blogs.form.showInLandingDescription",
          activeLabel: "blogs.yes",
          inactiveLabel: "blogs.no",
          type: "toggle"
        },
        {
          kind: "simple",
          name: "landingOrder",
          label: toUpperCase(t("blogs.form.landingOrder")),
          type: "number",
          props: {
            min: 0,
            max: 100,
            step: 1,
            placeholder: t("blogs.form.landingOrderPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "slug",
          label: toUpperCase(t("blogs.form.slug")),
          type: "text",
          props: {
            placeholder: t("blogs.form.slugPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "categories",
          label: toUpperCase(t("blogs.form.categories")),
          type: "translated-select",

          props: {
            endpoints: "/category/list",
            mode: "multiple",
            translationKey: "name",
            placeholder: t("blogs.form.categories"),
            required: true
          }
        }
      ] as FieldConfig<BlogFormValues>[]
    },
    {
      key: "background",
      title: toUpperCase(t("blogs.form.background")),
      fields: [
        {
          kind: "simple",
          name: "background",
          label: toUpperCase(t("blogs.form.backgroundLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<BlogFormValues>[]
    },
    {
      key: "metaInformation",
      title: toUpperCase(t("blogs.form.metaInformation")),
      fields: [
        {
          kind: "simple",
          name: "metaTitle",
          label: toUpperCase(t("blogs.form.metaTitleLabel")),
          type: "text",
          props: {
            placeholder: t("blogs.form.metaTitlePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaDescription",
          label: toUpperCase(t("blogs.form.metaDescriptionLabel")),
          type: "textarea",
          props: {
            placeholder: t("blogs.form.metaDescriptionPlaceholder"),
            rows: 5,
            maxLength: 500
          }
        },
        {
          kind: "simple",
          name: "metaKeywords",
          label: toUpperCase(t("blogs.form.metaKeywordsLabel")),
          type: "text",
          props: {
            placeholder: t("blogs.form.metaKeywordsPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "metaImage",
          label: toUpperCase(t("blogs.form.metaImageLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<BlogFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<BlogFormValues>
      resourceName="blogs"
      mode={mode}
      id={slug ?? undefined}
      schema={blogSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("blogs.form.title")),
            placeholder: toUpperCase(t("blogs.form.title")),
            required: true,
            fullWidth: true,
            type: "text"
          },
          {
            name: "content",
            label: toUpperCase(t("blogs.form.content")),
            placeholder: toUpperCase(t("blogs.form.content")),
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

export default BlogForm;
