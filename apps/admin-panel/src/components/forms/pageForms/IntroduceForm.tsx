import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { IntroduceFormValues } from "@/validations/website/introduce.validation.ts";
import { introduceSchema } from "@/validations/website/introduce.validation.ts";
import { FormProps } from "@/types";
import { Introduce } from "@/types/website";

const defaultValues: IntroduceFormValues = {
  translations: {
    en: { headline: "", description: "" },
    ka: { headline: "", description: "" }
  }
};

export const IntroduceForm: React.FC<FormProps> = ({
  mode,
  id = null,
  entityData,
  refetch
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = (
    entity: Introduce
  ): Partial<IntroduceFormValues> => {
    if (!entity) return {};
    const translations = entity.translations ?? [];
    const en = translations.find((tr) => tr.language?.code === "en");
    const ka = translations.find((tr) => tr.language?.code === "ka");

    return {
      translations: {
        en: {
          headline: en?.headline ?? "",
          description: en?.description ?? ""
        },
        ka: {
          headline: ka?.headline ?? "",
          description: ka?.description ?? ""
        }
      }
    };
  };

  const fetchEntity = async () => {
    const res = await axios.get("/introduce");
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: IntroduceFormValues) => {
    await axios.post("/introduce", payload);
  };

  const updateEntity = async (
    entityId: string,
    payload: IntroduceFormValues
  ) => {
    await axios.put(`/introduce/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/introduce/${entityId}`);
  };

  return (
    <GenericEntityForm<IntroduceFormValues>
      resourceName="introduce"
      mode={mode}
      id={id ?? undefined}
      schema={introduceSchema(t)}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      onDeleteSuccess={() => refetch}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "headline",
            label: toUpperCase(t("introduce.form.headline")),
            placeholder: toUpperCase(t("introduce.form.headline")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("introduce.form.description")),
            placeholder: toUpperCase(t("introduce.form.description")),
            required: true,
            fullWidth: true,
            type: "markdown"
          }
        ] as const
      }
      sections={{ left: [], right: [] }}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
      entityData={entityData}
      refetch={refetch}
      allowModeToggleForReadonly
    />
  );
};

export default IntroduceForm;
