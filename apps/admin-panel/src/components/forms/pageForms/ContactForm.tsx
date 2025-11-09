import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { buildMapper, toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { ContactFormValues } from "@/validations/website/contact.validation.ts";
import { contactSchema } from "@/validations/website/contact.validation.ts";
import { FieldConfig, FormProps } from "@/types";

const defaultValues: ContactFormValues = {
  background: null,
  location: "",
  translations: {
    en: { title: "", description: "" },
    ka: { title: "", description: "" }
  }
};

export const ContactForm: React.FC<FormProps> = ({
  mode,
  id = null,
  entityData,
  refetch
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = buildMapper<ContactFormValues>({
    fileFields: ["background"],
    copyFields: ["location"],
    translations: {
      fields: ["title", "description"]
    }
  });
  const fetchEntity = async () => {
    const res = await axios.get("/contact");
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: ContactFormValues) => {
    await axios.post("/contact", payload);
  };

  const updateEntity = async (entityId: string, payload: ContactFormValues) => {
    await axios.put(`/contact/${entityId}`, payload);
  };

  const deleteEntity = async () => {
    await axios.delete("/contact");
  };

  const rightSections = [
    {
      key: "location",
      title: toUpperCase(t("contact.form.management")),
      fields: [
        {
          kind: "simple",
          name: "location",
          label: toUpperCase(t("contact.form.location")),
          type: "location",
          props: {
            step: 1,
            placeholder: t("contact.form.locationPlaceholder"),
            fullWidth: true
          }
        }
      ] as FieldConfig<ContactFormValues>[]
    },
    {
      key: "background",
      title: toUpperCase(t("contact.form.background")),
      fields: [
        {
          kind: "simple",
          name: "background",
          label: toUpperCase(t("contact.form.backgroundLabel")),
          type: "media",
          props: {
            maxSizeMB: 5,
            acceptedFormats: ["PNG", "JPG", "SVG", "WEBP"],
            previewHeight: "h-[248px]"
          }
        }
      ] as FieldConfig<ContactFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<ContactFormValues>
      resourceName="contact"
      mode={mode}
      id={id ?? undefined}
      schema={contactSchema(t)}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      onDeleteSuccess={() => {}}
      translationLocales={["en", "ka"]}
      translationFields={
        [
          {
            name: "title",
            label: toUpperCase(t("contact.form.title")),
            placeholder: toUpperCase(t("contact.form.title")),
            fullWidth: true,
            required: true
          },
          {
            name: "description",
            label: toUpperCase(t("contact.form.description")),
            placeholder: toUpperCase(t("contact.form.description")),
            type: "textarea",
            rows: 5,
            maxLength: 500,
            required: true
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

export default ContactForm;
