import React from "react";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { GenericEntityForm } from "..";
import type { FooterFormValues } from "@/validations/website/footer.validation.ts";
import { footerSchema } from "@/validations/website/footer.validation.ts";
import { FieldConfig } from "@/types";
import { Footer } from "@/types/website";
import { TranslatedSelect } from "@/components/TranslatedSelect";

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
      title: toUpperCase(t("footers.management")),
      fields: [
        {
          kind: "simple",
          name: "phone",
          label: toUpperCase(t("footers.form.phone")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("footers.form.phonePlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "simple",
          name: "email",
          label: toUpperCase(t("footers.form.email")),
          type: "text",
          props: {
            step: 1,
            placeholder: t("footers.form.emailPlaceholder"),
            fullWidth: true
          }
        },
        {
          kind: "custom",
          name: "socials",
          label: toUpperCase(t("footers.form.socials")),
          render: (form) => {
            return (
              <div className="mb-5">
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  {toUpperCase(t("footers.form.socials"))}
                </label>
                <TranslatedSelect
                  endpoints="/socials"
                  translationKey="name"
                  value={(form.getValues() as any).socials ?? []}
                  multiple
                  placeholder={t("footers.form.selectSocials") as string}
                  onChange={(vals) => form.setValue("socials" as any, vals)}
                />
              </div>
            );
          }
        },
        {
          kind: "custom",
          name: "pages",
          label: toUpperCase(t("footers.form.pages")),
          render: (form) => {
            return (
              <div className="mb-5">
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  {toUpperCase(t("footers.form.pages"))}
                </label>
                <TranslatedSelect
                  endpoints="/page-component"
                  translationKey="name"
                  value={(form.getValues() as any).pages ?? []}
                  multiple
                  placeholder={t("footers.form.selectPages") as string}
                  onChange={(vals) => form.setValue("pages" as any, vals)}
                />
              </div>
            );
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
