import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FooterFormValues } from "@/validations/website/footer.validation.ts";
import { footerSchema } from "@/validations/website/footer.validation.ts";
import { FieldConfig } from "@/types";
import { Footer } from "@/types/website";

export interface FooterFormProps {
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  entityData?: any;
  refetch?: () => Promise<any> | void;
}

const defaultValues: FooterFormValues = {
  phone: "",
  email: "",
  socials: [],
  pages: []
};

export const FooterForm: React.FC<FooterFormProps> = ({
  mode,
  id = null,
  entityData,
  refetch
}) => {
  const { t } = useTranslation();

  const mapFetchedToForm = (entity: Footer): Partial<FooterFormValues> => {
    if (!entity) return {};
    const { phone, email, socials, pages } = entity;
    const filteredSocials = (socials || []).map((social) => social.id);
    const filteredPages = (pages || []).map((page) => page.id);
    return {
      phone: phone || "",
      email: email || "",
      socials: filteredSocials,
      pages: filteredPages
    };
  };

  const fetchEntity = async () => {
    const res = await axios.get("/footer");
    return res.data?.data ?? res.data;
  };

  const createEntity = async (payload: FooterFormValues) => {
    await axios.post("/footer", payload);
  };

  const updateEntity = async (entityId: string, payload: FooterFormValues) => {
    await axios.put(`/footer/${entityId}`, payload);
  };

  const deleteEntity = async (entityId: string) => {
    await axios.delete(`/footer/${entityId}`);
  };

  const leftSections = [
    {
      key: "management",
      title: toUpperCase(t("footer.form.management")),
      fields: [
        {
          kind: "simple",
          name: "phone",
          label: toUpperCase(t("footer.form.phone")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("footer.form.phonePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "email",
          label: toUpperCase(t("footer.form.email")),
          type: "email",
          props: {
            step: 1,
            placeholder: t("footer.form.emailPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "socials",
          label: toUpperCase(t("footer.form.socials")),
          type: "translated-select",

          props: {
            endpoints: "/social/list",
            mode: "multiple",
            translationKey: "name",
            placeholder: t("footer.form.socialsPlaceholder"),
            required: true
          }
        },
        {
          kind: "simple",
          name: "pages",
          label: toUpperCase(t("footer.form.pages")),
          type: "translated-select",
          props: {
            endpoints: "/page-component/list",
            mode: "multiple",
            translationKey: "name",
            placeholder: t("footer.form.pagesPlaceholder"),
            required: true
          }
        }
      ] as FieldConfig<FooterFormValues>[]
    }
  ];

  return (
    <GenericEntityForm<FooterFormValues, any>
      resourceName="footer"
      mode={mode}
      id={id ?? undefined}
      schema={footerSchema(t)}
      defaultValues={defaultValues}
      fetchEntity={fetchEntity}
      createEntity={createEntity}
      updateEntity={updateEntity}
      deleteEntity={deleteEntity}
      onDeleteSuccess={() => {}}
      translationLocales={["en", "ka"]}
      sections={{ left: leftSections, right: [] }}
      mapFetchedToForm={mapFetchedToForm}
      renderFooter={() => null}
      entityData={entityData}
      refetch={refetch}
      allowModeToggleForReadonly
    />
  );
};

export default FooterForm;
