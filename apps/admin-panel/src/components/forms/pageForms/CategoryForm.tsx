import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { CategoryFormValues } from "@/validations/website/category.validation.ts";
import { categorySchema } from "@/validations/website/category.validation.ts";

export interface CategoryFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: CategoryFormValues = {
  translations: {
    en: { name: "" },
    ka: { name: "" }
  }
};

export const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/categories"
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<CategoryFormValues> => {
    if (!entity) return {};
    const translations = entity.translations ?? [];
    const en = translations.find((tr: any) => tr.language?.code === "en") ?? {};
    const ka = translations.find((tr: any) => tr.language?.code === "ka") ?? {};

    return {
      translations: {
        en: {
          name: en.name ?? ""
        },
        ka: {
          name: ka.name ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/category/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: CategoryFormValues) => {
    await axios.post("/category", payload);
  };

  const updateEntity = async (
    entityId: string,
    payload: CategoryFormValues
  ) => {
    await axios.put(`/category/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/category/${entityId}`);
  };

  return (
    <GenericEntityForm<CategoryFormValues, any>
      resourceName="categories"
      mode={mode}
      id={id ?? undefined}
      schema={categorySchema(t)}
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
            label: toUpperCase(t("categories.form.name")),
            placeholder: toUpperCase(t("categories.form.name")),
            fullWidth: true,
            required: true
          }
        ] as const
      }
      sections={{ left: [], right: [] }}
      onSuccessNavigate={onSuccessNavigate}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
    />
  );
};

export default CategoryForm;
