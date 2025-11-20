import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { IntroduceFormValues } from "@/validations/website/introduce.validation.ts";
import { introduceSchema } from "@/validations/website/introduce.validation.ts";
import { FieldConfig, FormProps } from "@/types";

const defaultValues: IntroduceFormValues = {
  translations: {
    en: { headline: "", description: "" },
    ka: { headline: "", description: "" }
  },
  thumbnail: null,
  video: null
};

export const IntroduceForm: React.FC<FormProps> = ({
  mode,
  id = null,
  entityData,
  refetch
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = buildMapper<IntroduceFormValues>({
    translations: {
      fields: ["headline", "description"]
    },
    fileFields: ["video", "thumbnail"]
  });

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

  const rightSections = [
    {
      key: "video",
      title: toUpperCase(t("introduce.form.video")),
      fields: [
        {
          kind: "simple",
          name: "video",
          label: toUpperCase(t("introduce.form.videoLabel")),
          type: "media",
          props: {
            maxSizeMB: 100,
            acceptedFormats: ["MP4", "WEBM", "OGG", "MKV"],
            previewWidth: "w-full",
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<IntroduceFormValues>[]
    },
    {
      key: "thumbnail",
      title: toUpperCase(t("introduce.form.thumbnail")),
      fields: [
        {
          kind: "simple",
          name: "thumbnail",
          label: toUpperCase(t("introduce.form.thumbnailLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<IntroduceFormValues>[]
    }
  ];

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
      onDeleteSuccess={() => refetch?.()}
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
      sections={{ left: [], right: rightSections }}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
      entityData={entityData}
      refetch={refetch}
      allowModeToggleForReadonly
    />
  );
};

export default IntroduceForm;
