import React, { useEffect, useMemo, useState } from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  PathValue,
  Path
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toUpperCase, setHookFormErrors } from "@/utils";
import {
  ActionBar,
  FormShell,
  FormSection,
  TwoColumnLayout,
  TranslationsPanel,
  FieldGroup,
  MediaUploader,
  MetadataDisplay
} from ".";
import { Button, LocaleTabSwitcher, StatusToggle } from "@/components/ui";
import { DeleteConfirmDialog } from "@/components/forms";
import { useToast } from "@/hooks";
import { FieldConfig, GenericEntityFormProps } from "@/types";
import { ArrowLeft, Edit3 } from "lucide-react";
import { locales } from "@/libs";

type localeType = "en" | "ka";

export function GenericEntityForm<
  TForm extends FieldValues = FieldValues,
  TEntity = any
>({
  resourceName = "item",
  mode,
  id,
  schema,
  defaultValues,
  fetchEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  translationLocales = ["en", "ka"],
  translationFields = [],
  sections = { left: [], right: [] },
  onSuccessNavigate,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  actionBarProps,
  mapFetchedToForm,
  renderFooter,
  entityData,
  refetch,
  externalMode,
  onModeChange,
  allowModeToggleForReadonly = false
}: GenericEntityFormProps<TForm, TEntity>) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<TForm>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<TForm>
  });

  const { reset, handleSubmit, setError, watch, formState, getValues } = form;

  const watchedAll = watch();

  const useInternalQuery = !entityData && !!fetchEntity && !!id;

  const entityQuery = useQuery(
    ["entity", resourceName, id],
    async () => {
      if (!fetchEntity) return null;
      return id ? await fetchEntity(id as any) : await fetchEntity();
    },
    {
      enabled: useInternalQuery
    }
  );

  useEffect(() => {
    const data = entityData ?? entityQuery.data;
    if (data) {
      const mapped = mapFetchedToForm
        ? mapFetchedToForm(data)
        : (data as unknown as Partial<TForm>);
      reset({ ...(defaultValues as any), ...(mapped as any) } as any);
    } else {
      reset(defaultValues as any);
      if (!externalMode) {
        setInternalMode("create");
        onModeChange?.("create");
      }
    }
  }, [
    entityData,
    entityQuery.data,
    reset,
    mapFetchedToForm,
    defaultValues,
    externalMode,
    onModeChange
  ]);

  const [internalMode, setInternalMode] = useState<
    "create" | "edit" | "readonly"
  >(externalMode ?? mode);

  useEffect(() => {
    if (externalMode) {
      setInternalMode(externalMode);
    } else if (mode) {
      setInternalMode(mode);
    }
  }, [externalMode, mode]);

  const setMode = (m: "create" | "edit" | "readonly") => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: TForm) => {
      if (!createEntity) throw new Error("createEntity not provided");
      return createEntity(payload);
    },
    onSuccess: async () => {
      toast.added(resourceName);
      onCreateSuccess?.();
      try {
        await refetch?.();
      } catch (e) {
        // ignore
      }
      setMode("readonly");
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: TForm) => {
      if (!updateEntity) throw new Error("updateEntity not provided");
      return updateEntity(id as any, payload);
    },
    onSuccess: async () => {
      toast.updated(resourceName);
      onUpdateSuccess?.();
      try {
        await refetch?.();
      } catch (e) {
        // ignore
      }
      setMode("readonly");
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteEntity)
        throw new Error("deleteEntity not provided or id missing");
      return deleteEntity(id as any);
    },
    onSuccess: async () => {
      reset(defaultValues);
      toast.deleted(resourceName);
      onDeleteSuccess?.();
      try {
        await refetch?.();
      } catch (e) {
        // ignore
      }
      if (!externalMode) {
        setMode("create");
      }
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const onSubmit = handleSubmit(async (values: TForm) => {
    if (internalMode === "create") {
      await createMutation.mutateAsync(values);
    } else if (internalMode === "edit") {
      await updateMutation.mutateAsync(values);
    }
  });

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  const [activeLocale, setActiveLocale] = useState<string>(
    translationLocales && translationLocales.length
      ? translationLocales[0]
      : "en"
  );

  useEffect(() => {
    if (
      !translationLocales.includes(activeLocale) &&
      translationLocales.length
    ) {
      setActiveLocale(translationLocales[0]);
    }
  }, [translationLocales, activeLocale]);

  const handleLocaleChange = async (next: string) => {
    await form.trigger(`translations.${activeLocale}` as Path<TForm>);
    setActiveLocale(next);
  };

  const localeErrorCounts = useMemo(() => {
    const errs: Record<string, number> = {};
    translationLocales.forEach((loc) => {
      const e = (formState.errors as any)?.translations?.[loc] ?? {};
      errs[loc] = e ? Object.keys(e).length : 0;
    });
    return errs;
  }, [formState.errors, translationLocales, watchedAll]);

  const toBool = (val: unknown) =>
    typeof val === "string" ? val === "true" : !!val;

  const getErrorMessagesForLocale = (locale: string) => {
    const errsObj = (formState.errors as any)?.translations?.[locale] ?? {};
    const out: Record<string, string> = {};
    Object.entries(errsObj).forEach(([k, v]) => {
      out[k] = (v as any)?.message ?? "";
    });
    return out;
  };

  const renderField = (f: FieldConfig<TForm>, idx?: number) => {
    if (f.kind === "custom") {
      const key = f.name ?? f.label ?? `custom-${idx ?? 0}`;
      return (
        <React.Fragment key={key}>
          {f.render(form as UseFormReturn<TForm>)}
        </React.Fragment>
      );
    }

    function getFieldValue<Name extends Path<TForm>>(name: Name) {
      const values = getValues() as unknown as Record<string, unknown>;
      return values[name as unknown as string] as PathValue<TForm, Name>;
    }

    const name = f.name!;
    const label = f.label ?? name;
    const description = f.description ?? name;

    const watchedValue = getFieldValue(name as Path<TForm>);

    switch (f.type) {
      case "text":
        return (
          <FieldGroup
            key={name}
            label={toUpperCase(
              typeof label === "string" ? t(label) : (label as any)
            )}
            required={f.props?.required}
            value={watchedValue ?? ""}
            className="mb-5"
            onChange={(v) =>
              form.setValue(
                name as Path<TForm>,
                v as unknown as PathValue<TForm, Path<TForm>>
              )
            }
            error={(form.formState.errors as any)[name]?.message}
            placeholder={
              f.props?.placeholder
                ? t(f.props.placeholder as string)
                : undefined
            }
          />
        );

      case "textarea":
        return (
          <FieldGroup
            key={name}
            label={toUpperCase(t(label as string))}
            type="textarea"
            required={f.props?.required}
            className="mb-5"
            value={watchedValue ?? ""}
            onChange={(v) =>
              form.setValue(
                name as Path<TForm>,
                v as unknown as PathValue<TForm, Path<TForm>>
              )
            }
            error={(form.formState.errors as any)[name]?.message}
            placeholder={
              f.props?.placeholder
                ? t(f.props.placeholder as string)
                : undefined
            }
            rows={f.props?.rows ?? 5}
            maxLength={f.props?.maxLength}
          />
        );

      case "number":
        return (
          <FieldGroup
            key={name}
            label={toUpperCase(t(label as string))}
            type="number"
            value={watchedValue}
            onChange={(v) =>
              form.setValue(
                name as Path<TForm>,
                Number(v) as unknown as PathValue<TForm, Path<TForm>>
              )
            }
            placeholder={
              f.props?.placeholder
                ? t(f.props.placeholder as string)
                : undefined
            }
            required={f.props?.required}
            helperText={
              f.props?.description ? t(f.props.description) : undefined
            }
            className={f.props?.fullWidth ? "mb-5 md:col-span-2" : "mb-5"}
            error={(form.formState.errors as any)[name]?.message}
          />
        );
      case "toggle":
        return (
          <div key={name}>
            <FieldGroup
              key={name}
              label={toUpperCase(t(label as string))}
              value={String(watchedValue ?? "")}
              className="mb-5"
              onChange={(v) =>
                form.setValue(
                  name as Path<TForm>,
                  toBool(v) as unknown as PathValue<TForm, Path<TForm>>
                )
              }
            />
          </div>
        );
      case "status":
        return (
          <div className="mb-5 flex flex-col gap-6" key={name}>
            <MetadataDisplay
              createdAt={
                (entityQuery.data as any)?.createdAt ??
                (entityData as any)?.createdAt
              }
              updatedAt={
                (entityQuery.data as any)?.updatedAt ??
                (entityData as any)?.updatedAt
              }
            />
            <StatusToggle
              label={toUpperCase(t(label as string))}
              description={toUpperCase(t(description as string))}
              value={(form.getValues() as any).active ?? false}
              onChange={(v) =>
                form.setValue(
                  name as Path<TForm>,
                  toBool(v) as unknown as PathValue<TForm, Path<TForm>>
                )
              }
              activeLabel={toUpperCase(t("headers.form.active"))}
              inactiveLabel={toUpperCase(t("headers.form.inactive"))}
            />
          </div>
        );

      case "media":
        return (
          <MediaUploader
            value={watchedValue ?? null}
            key={name}
            onChange={(v) =>
              form.setValue(
                name as Path<TForm>,
                v as unknown as PathValue<TForm, Path<TForm>>
              )
            }
            {...(f.props || {})}
          />
        );

      default:
        return null;
    }
  };

  const leftSections = sections.left ?? [];
  const rightSections = sections.right ?? [];

  const translationsValues = (locale: string) =>
    (form.getValues() as any).translations?.[locale] ?? {};

  const titleKey = `${resourceName}.form.${internalMode}Title`;
  const subtitleKey = `${resourceName}.form.subtitle`;

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="lg"
        className="group"
        onClick={() =>
          onSuccessNavigate ? navigate(onSuccessNavigate) : navigate(-1)
        }
        type="button"
      >
        <ArrowLeft className="h-5 w-5 transition-all duration-200 group-hover:text-white" />
      </Button>

      {internalMode === "readonly" && allowModeToggleForReadonly && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMode("edit")}
          type="button"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          {toUpperCase(t(`${resourceName}.form.edit`) || "Edit")}
        </Button>
      )}
    </div>
  );

  const actionBarElement = (
    <ActionBar
      mode={internalMode}
      isSubmitting={isSubmitting}
      onCancel={() =>
        onSuccessNavigate ? navigate(onSuccessNavigate) : navigate(-1)
      }
      onDelete={
        internalMode === "edit" && deleteEntity
          ? () => setDeleteDialogOpen(true)
          : undefined
      }
      {...actionBarProps}
    />
  );

  return (
    <form onSubmit={onSubmit}>
      <FormShell
        title={titleKey}
        subtitle={subtitleKey}
        headerActions={headerActions}
        actionBar={actionBarElement}
      >
        <TwoColumnLayout
          left={
            <>
              {translationFields.length ? (
                <FormSection
                  title={toUpperCase(
                    t(`${resourceName}.form.contentTranslations`)
                  )}
                  description={toUpperCase(
                    t(`${resourceName}.form.contentTranslationsDescription`)
                  )}
                >
                  {translationLocales && translationLocales.length > 0 && (
                    <LocaleTabSwitcher
                      locales={locales}
                      activeLocale={activeLocale}
                      onChange={handleLocaleChange}
                      errors={localeErrorCounts}
                    />
                  )}

                  <div className="mt-6">
                    <TranslationsPanel
                      activeLocale={activeLocale}
                      fields={translationFields}
                      values={translationsValues(activeLocale)}
                      errors={getErrorMessagesForLocale(activeLocale)}
                      onChange={(fieldName, value) =>
                        form.setValue(
                          `translations.${activeLocale}.${fieldName}` as unknown as Path<TForm>,
                          value as unknown as PathValue<TForm, Path<TForm>>
                        )
                      }
                      disabled={internalMode === "readonly"}
                    />
                  </div>
                </FormSection>
              ) : (
                ""
              )}
              {leftSections.map((sec) => (
                <FormSection
                  key={sec.key ?? sec.title}
                  title={sec.title}
                  description={sec.description}
                >
                  {sec.fields?.map((f, idx) => (
                    <React.Fragment
                      key={
                        (f.kind === "simple" && (f.name as string)) ||
                        (f as any).label ||
                        `field-${idx}`
                      }
                    >
                      {renderField(f, idx)}
                    </React.Fragment>
                  ))}
                </FormSection>
              ))}
            </>
          }
          right={
            <>
              {rightSections.map((sec) => (
                <FormSection
                  key={sec.key ?? sec.title}
                  title={sec.title}
                  className="!gap-0"
                  description={sec.description}
                >
                  {sec.fields?.map((f, idx) => (
                    <React.Fragment
                      key={
                        (f.kind === "simple" && (f.name as string)) ||
                        (f as any).label ||
                        `field-${idx}`
                      }
                    >
                      {renderField(f, idx)}
                    </React.Fragment>
                  ))}
                </FormSection>
              ))}

              <div className="hidden lg:block">{actionBarElement}</div>
            </>
          }
        />
      </FormShell>

      {deleteEntity && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={async () => {
            await deleteMutation.mutateAsync();
          }}
          itemName={(form.getValues() as any)?.translations?.en?.name}
          itemType={toUpperCase(
            t(`${resourceName}.form.${resourceName}`) || resourceName
          )}
          isLoading={deleteMutation.isLoading}
        />
      )}

      {renderFooter && renderFooter(form as UseFormReturn<TForm>)}
    </form>
  );
}

export default GenericEntityForm;
