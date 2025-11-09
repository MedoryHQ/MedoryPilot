import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig, FormProps } from "@/types";
import type { VideoFormValues } from "@/validations/website/video.validation";
import { videoSchema } from "@/validations/website/video.validation";

const defaultValues: VideoFormValues = {
  date: undefined,
  link: "",
  thumbnail: null,
  translations: {
    en: { name: "" },
    ka: { name: "" }
  }
};

export const VideoForm: React.FC<FormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/videos"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = buildMapper<VideoFormValues>({
    fileFields: ["thumbnail"],
    copyFields: ["link", "date"],
    custom: {
      date: (entity) => (entity.date ? new Date(entity.date) : undefined)
    },
    translations: {
      fields: ["name"]
    }
  });

  const fetchEntity = async (entityId?: string) => {
    const res = await axios.get(`/video/${entityId}`);
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: VideoFormValues) => {
    await axios.post("/video", payload);
  };

  const updateEntity = async (entityId: string, payload: VideoFormValues) => {
    await axios.put(`/video/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/video/${entityId}`);
  };

  const rightSections = [
    {
      key: "name",
      title: toUpperCase(t("videos.management")),
      fields: [
        {
          kind: "simple",
          name: "link",
          label: toUpperCase(t("videos.form.link")),
          type: "link",
          props: {
            step: 1,
            placeholder: t("videos.form.link"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "date",
          label: toUpperCase(t("videos.form.date")),
          type: "date",
          props: {
            step: 1,
            placeholder: t("videos.form.date"),
            fullWidth: true
          }
        }
      ] as FieldConfig<VideoFormValues>[]
    },
    {
      key: "thumbnail",
      title: toUpperCase(t("videos.form.thumbnail")),
      fields: [
        {
          kind: "simple",
          name: "thumbnail",
          label: toUpperCase(t("videos.form.thumbnail")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<VideoFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<VideoFormValues>
      resourceName="videos"
      mode={mode}
      id={id ?? undefined}
      schema={videoSchema(t, i18n.language as "en" | "ka")}
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
            label: toUpperCase(t("videos.form.name")),
            placeholder: toUpperCase(t("videos.form.name")),
            required: true,
            fullWidth: true,
            rows: 1
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

export default VideoForm;
