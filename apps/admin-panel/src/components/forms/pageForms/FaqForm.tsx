import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { FaqFormValues } from "@/validations/website/faq.validation";
import { faqSchema } from "@/validations/website/faq.validation";
import { Faq } from "@/types/website";

export interface FaqFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: FaqFormValues = {
  order: 0,
  translations: {
    en: { question: "", answer: "" },
    ka: { question: "", answer: "" }
  }
};

export const FaqForm: React.FC<FaqFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/faqs"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: Faq): Partial<FaqFormValues> => {
    if (!entity) return {};
    const translations = entity.translations ?? [];
    const en = translations.find((tr) => tr.language?.code === "en");
    const ka = translations.find((tr) => tr.language?.code === "ka");

    return {
      order: entity.order,
      translations: {
        en: {
          question: en?.question ?? "",
          answer: en?.answer ?? ""
        },
        ka: {
          question: ka?.question ?? "",
          answer: ka?.answer ?? ""
        }
      }
    };
  };

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/faq/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: FaqFormValues) => {
    await axios.post("/faq", payload);
  };

  const updateEntity = async (entityId: string, payload: FaqFormValues) => {
    await axios.put(`/faq/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/faq/${entityId}`);
  };

  const rightSections = [
    {
      key: "order",
      title: toUpperCase(t("faqs.form.order")),
      fields: [
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
            fullWidth: false
          }
        }
      ] as FieldConfig<FaqFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<FaqFormValues>
      resourceName="faqs"
      mode={mode}
      id={id ?? undefined}
      schema={faqSchema(t, i18n.language as "en" | "ka")}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "question",
            label: toUpperCase(t("faqs.form.question")),
            placeholder: toUpperCase(t("faqs.form.question")),
            required: true,
            fullWidth: true,
            rows: 1
          },
          {
            name: "answer",
            label: toUpperCase(t("faqs.form.answer")),
            placeholder: toUpperCase(t("faqs.form.answer")),
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

export default FaqForm;
