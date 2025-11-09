import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

import { GenericEntityForm } from "..";
import type { FieldConfig } from "@/types";
import type { VideoFormValues } from "@/validations/website/video.validation";
import { videoSchema } from "@/validations/website/video.validation";

export interface VideoFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  onSuccessNavigate?: string;
}

const defaultValues: VideoFormValues = {
  date: undefined,
  link: "",
  thumbnail: null,
  translations: {
    en: { name: "" },
    ka: { name: "" }
  }
};

export const VideoForm: React.FC<VideoFormProps> = ({
  mode,
  id = null,
  onSuccessNavigate = "/landing/videos"
}) => {
  const { t, i18n } = useTranslation();

  const mapFetchedToForm = (entity: any): Partial<VideoFormValues> => {
    if (!entity) return {};
    const { link, date } = entity;

    const translations = entity.translations ?? [];
    const en = translations.find((tr: any) => tr.language?.code === "en") ?? {};
    const ka = translations.find((tr: any) => tr.language?.code === "ka") ?? {};

    const thumbnail = entity.thumbnail
      ? {
          path: entity.thumbnail.path ?? entity.thumbnail.url ?? "",
          name: entity.thumbnail.name ?? "",
          size: entity.thumbnail.size ?? undefined
        }
      : null;

    return {
      thumbnail,
      ...(link ? { link } : {}),
      ...(date ? { date: new Date(date) } : {}),
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
          type: "text",
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
    <GenericEntityForm<VideoFormValues, any>
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
