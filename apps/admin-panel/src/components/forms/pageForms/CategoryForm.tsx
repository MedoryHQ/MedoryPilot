import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { CategoryFormValues } from "@/validations/website/category.validation.ts";
import { categorySchema } from "@/validations/website/category.validation.ts";
import { FormProps } from "@/types";

const defaultValues: CategoryFormValues = {
  translations: {
    en: { name: "" },
    ka: { name: "" }
  }
};

export const CategoryForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/categories"
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = buildMapper<CategoryFormValues>({
    translations: {
      fields: ["name"]
    }
  });
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
    <GenericEntityForm<CategoryFormValues>
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
