import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { TariffFormValues } from "@/validations/website/tariff.validation.ts";
import { tariffSchema } from "@/validations/website/tariff.validation.ts";

export interface TariffFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: TariffFormValues = {
  price: 0
};

export const TariffForm: React.FC<TariffFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/tariffs"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<TariffFormValues> => {
    if (!entity) return {};
    return {
      price: entity.price
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/tariff/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: TariffFormValues) => {
    await axios.post("/tariff", payload);
  };

  const updateEntity = async (entityId: string, payload: TariffFormValues) => {
    await axios.put(`/tariff/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/tariff/${entityId}`);
  };

  const leftSections = [
    {
      key: "price",
      title: toUpperCase(t("tariffs.management")),
      fields: [
        {
          kind: "simple",
          name: "price",
          label: toUpperCase(t("tariffs.form.price")),
          type: "number",
          props: {
            min: 0,
            max: 99999999,
            step: 1,
            placeholder: t("tariffs.form.pricePlaceholder"),
            fullWidth: false
          }
        }
      ] as FieldConfig<TariffFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<TariffFormValues, any>
      resourceName="tariffs"
      mode={mode}
      id={id ?? undefined}
      schema={tariffSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      sections={{ left: leftSections, right: [] }}
      onSuccessNavigate={onSuccessNavigate}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
    />
  );
};

export default TariffForm;
