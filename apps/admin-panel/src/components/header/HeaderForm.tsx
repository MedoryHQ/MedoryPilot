import React, { useState } from "react";
import { Button, StatusToggle, LocaleTabSwitcher } from "../ui";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setHookFormErrors, toUpperCase } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { useForm } from "react-hook-form";
import {
  HeaderFormValues,
  headerSchema
} from "@/validations/website/header.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetHeader } from "@/libs/queries";
import {
  ActionBar,
  DeleteConfirmDialog,
  FieldGroup,
  FormSection,
  FormShell,
  MediaUploader,
  MetadataDisplay,
  TwoColumnLayout
} from "../forms";
import { Separator } from "@radix-ui/react-select";

interface FormActionsProps {
  mode: "create" | "edit" | "readonly";
  id?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}

export const HeaderFormActions: React.FC<FormActionsProps> = ({
  mode,
  id,
  isSubmitting = false
}) => {
  const { t: rawT, i18n } = useTranslation();
  const t = (key: string, lang?: "en" | "ka") =>
    rawT(key, { lng: lang || i18n.language });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"en" | "ka">("en");

  const navigate = useNavigate();
  const { toast } = useToast(rawT);

  const {
    formState: { errors },
    setValue,
    watch,
    setError,
    handleSubmit,
    trigger,
    reset
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema(t, i18n.language as "en" | "ka")),
    defaultValues: {
      logo: null,
      active: false,
      translations: {
        en: { name: "", position: "", headline: "", description: "" },
        ka: { name: "", position: "", headline: "", description: "" }
      }
    }
  });
  const formValues = watch();

  const enErrors = errors.translations?.en;
  const kaErrors = errors.translations?.ka;
  const errorCounts = {
    en: enErrors ? Object.keys(enErrors).length : 0,
    ka: kaErrors ? Object.keys(kaErrors).length : 0
  };

  const handleLocaleChange = async (locale: "en" | "ka") => {
    await trigger(`translations.${activeLocale}`);
    setActiveLocale(locale);
  };

  const headerQuery = useGetHeader(mode === "edit" ? (id as string) : null);

  React.useEffect(() => {
    if (!headerQuery?.data?.data) return;

    const { translations, active, logo } = headerQuery.data.data;

    const enTranslation = translations?.find(
      (translation) => translation.language.code === "en"
    );
    const kaTranslation = translations?.find(
      (translation) => translation.language.code === "ka"
    );

    const formTranslations = {
      en: {
        description: enTranslation?.description || "",
        headline: enTranslation?.headline || "",
        position: enTranslation?.position || "",
        name: enTranslation?.name || ""
      },
      ka: {
        name: kaTranslation?.name || "",
        position: kaTranslation?.position || "",
        description: kaTranslation?.description || "",
        headline: kaTranslation?.headline || ""
      }
    };

    const formattedLogo = logo
      ? {
          path: (logo as any).path ?? (logo as any).url ?? "",
          name: (logo as any).name ?? "",
          size: (logo as any).size ?? undefined
        }
      : null;

    reset({
      logo: formattedLogo,
      active: !!active,
      translations: formTranslations
    });
  }, [headerQuery.data, reset]);

  const { mutateAsync: createHeader } = useMutation({
    mutationFn: async (values: HeaderFormValues) => {
      await axios.post("/header", values);
    },
    onSuccess: () => {
      toast.added("header");
      navigate("/landing/headers");
    },
    onError: (error: any) => {
      setHookFormErrors(
        error,
        toast,
        rawT,
        i18n.language as "ka" | "en",
        setError
      );
    }
  });

  const { mutateAsync: editHeader } = useMutation({
    mutationFn: async (values: HeaderFormValues) => {
      await axios.put(`/header/${id}`, values);
    },
    onSuccess: () => {
      toast.updated("header");
      navigate("/landing/headers");
    },
    onError: (error: any) => {
      setHookFormErrors(
        error,
        toast,
        rawT,
        i18n.language as "ka" | "en",
        setError
      );
    }
  });

  const { mutateAsync: deleteHeader } = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await axios.delete(`/header/${id}`);
    },
    onSuccess: () => {
      toast.deleted("header");
      navigate("/landing/headers");
    },
    onError: (error: any) => {
      setHookFormErrors(
        error,
        toast,
        rawT,
        i18n.language as "ka" | "en",
        setError
      );
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    if (mode === "create") {
      await createHeader(data);
    } else if (mode === "edit") {
      await editHeader(data);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <FormShell
        title={toUpperCase(rawT(`headers.form.${mode}Title`))}
        subtitle={toUpperCase(rawT("headers.form.subtitle"))}
        headerActions={
          <Button
            variant="ghost"
            size="lg"
            className="group"
            onClick={() => navigate("/landing/headers")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5 transition-all duration-200 group-hover:text-white" />
          </Button>
        }
        actionBar={
          <ActionBar
            mode={mode}
            isSubmitting={isSubmitting}
            onCancel={() => navigate("/landing/headers")}
            onDelete={
              mode === "edit" ? () => setShowDeleteDialog(true) : undefined
            }
          />
        }
      >
        <TwoColumnLayout
          left={
            <FormSection
              title={toUpperCase(rawT("headers.form.contentTranslations"))}
              description={toUpperCase(
                rawT("headers.form.contentTranslationsDescription")
              )}
            >
              <LocaleTabSwitcher
                locales={[
                  { code: "en", label: "English", flag: "🇬🇧" },
                  { code: "ka", label: "ქართული", flag: "🇬🇪" }
                ]}
                activeLocale={activeLocale}
                onChange={handleLocaleChange}
                errors={errorCounts}
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {activeLocale === "en" ? (
                  <>
                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.name"))}
                      required
                      value={formValues.translations.en.name}
                      onChange={(v) => setValue("translations.en.name", v)}
                      error={errors.translations?.en?.name?.message}
                      placeholder={rawT("headers.form.namePlaceholder")}
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.position"))}
                      required
                      value={formValues.translations.en.position}
                      onChange={(v) => setValue("translations.en.position", v)}
                      error={errors.translations?.en?.position?.message}
                      placeholder={rawT("headers.form.positionPlaceholder")}
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.headline"))}
                      required
                      value={formValues.translations.en.headline}
                      onChange={(v) => setValue("translations.en.headline", v)}
                      error={errors.translations?.en?.headline?.message}
                      placeholder={rawT("headers.form.headlinePlaceholder")}
                      className="md:col-span-2"
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.description"))}
                      type="textarea"
                      required
                      value={formValues.translations.en.description}
                      onChange={(v) =>
                        setValue("translations.en.description", v)
                      }
                      error={errors.translations?.en?.description?.message}
                      placeholder={rawT("headers.form.descriptionPlaceholder")}
                      rows={5}
                      maxLength={500}
                      className="md:col-span-2"
                    />
                  </>
                ) : (
                  <>
                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.name"))}
                      required
                      value={formValues.translations.ka.name}
                      onChange={(v) => setValue("translations.ka.name", v)}
                      error={errors.translations?.ka?.name?.message}
                      placeholder={rawT("headers.form.namePlaceholder")}
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.position"))}
                      required
                      value={formValues.translations.ka.position}
                      onChange={(v) => setValue("translations.ka.position", v)}
                      error={errors.translations?.ka?.position?.message}
                      placeholder={rawT("headers.form.positionPlaceholder")}
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.headline"))}
                      required
                      value={formValues.translations.ka.headline}
                      onChange={(v) => setValue("translations.ka.headline", v)}
                      error={errors.translations?.ka?.headline?.message}
                      placeholder={rawT("headers.form.headlinePlaceholder")}
                      className="md:col-span-2"
                    />

                    <FieldGroup
                      label={toUpperCase(rawT("headers.form.description"))}
                      type="textarea"
                      required
                      value={formValues.translations.ka.description}
                      onChange={(v) =>
                        setValue("translations.ka.description", v)
                      }
                      error={errors.translations?.ka?.description?.message}
                      placeholder={rawT("headers.form.descriptionPlaceholder")}
                      rows={5}
                      maxLength={500}
                      className="md:col-span-2"
                    />
                  </>
                )}
              </div>
            </FormSection>
          }
          right={
            <>
              <FormSection title={toUpperCase(rawT("headers.form.settings"))}>
                <StatusToggle
                  label={toUpperCase(rawT("headers.form.status"))}
                  description={toUpperCase(
                    rawT("headers.form.statusDescription")
                  )}
                  value={formValues.active || false}
                  onChange={(v) => setValue("active", v)}
                  activeLabel={toUpperCase(rawT("headers.form.active"))}
                  inactiveLabel={toUpperCase(rawT("headers.form.inactive"))}
                />

                {mode === "edit" && (
                  <>
                    <Separator className="my-6" />
                    <MetadataDisplay
                      createdAt={headerQuery.data?.data.createdAt || ""}
                      updatedAt={headerQuery.data?.data.updatedAt || ""}
                    />
                  </>
                )}
              </FormSection>

              <FormSection title={toUpperCase(rawT("headers.form.logo"))}>
                <MediaUploader
                  value={formValues.logo as any}
                  onChange={(v) => setValue("logo", v)}
                  label={toUpperCase(rawT("headers.form.logoLabel"))}
                  description={toUpperCase(
                    rawT("headers.form.logoDescription")
                  )}
                  maxSizeMB={5}
                  acceptedFormats={["PNG", "JPG", "SVG", "WEBP"]}
                  previewHeight="h-[248px]"
                />
              </FormSection>

              <div className="hidden lg:block">
                <ActionBar
                  mode={mode}
                  isSubmitting={isSubmitting}
                  onCancel={() => navigate("/landing/headers")}
                  onDelete={
                    mode === "edit"
                      ? () => setShowDeleteDialog(true)
                      : undefined
                  }
                />
              </div>
            </>
          }
        />
      </FormShell>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={deleteHeader}
        itemName={formValues.translations.en.name}
        itemType={toUpperCase(rawT("headers.form.header"))}
        isLoading={isSubmitting}
      />
    </form>
  );
};
