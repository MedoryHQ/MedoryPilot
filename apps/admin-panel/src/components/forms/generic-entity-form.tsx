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
  MediaUploader
} from ".";
import { Button, LocaleTabSwitcher } from "@/components/ui";
import { DeleteConfirmDialog } from "@/components/forms";
import { useToast } from "@/hooks";
import { FieldConfig, GenericEntityFormProps } from "@/types";
import { ArrowLeft } from "lucide-react";
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
  renderFooter
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

  const entityQuery = useQuery(
    ["entity", resourceName, id],
    async () => {
      if (!fetchEntity || !id) return null;
      return await fetchEntity(id);
    },
    {
      enabled: !!fetchEntity && !!id
    }
  );

  const hasResetRef = React.useRef(false);
  useEffect(() => {
    if (!entityQuery.data) return;
    if (hasResetRef.current) return;

    const data = entityQuery.data;
    if (!data) return;

    const mapped = mapFetchedToForm
      ? mapFetchedToForm(data)
      : (data as unknown as Partial<TForm>);

    reset({ ...(defaultValues as any), ...(mapped as any) } as any);
    hasResetRef.current = true;
  }, [entityQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (payload: TForm) => {
      if (!createEntity) throw new Error("createEntity not provided");
      return createEntity(payload);
    },
    onSuccess: () => {
      toast.added(resourceName);
      onCreateSuccess?.();
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: TForm) => {
      if (!updateEntity || !id)
        throw new Error("updateEntity not provided or id missing");
      return updateEntity(id, payload);
    },
    onSuccess: () => {
      toast.updated(resourceName);
      onUpdateSuccess?.();
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteEntity || !id)
        throw new Error("deleteEntity not provided or id missing");
      return deleteEntity(id);
    },
    onSuccess: () => {
      toast.deleted(resourceName);
      onDeleteSuccess?.();
      if (onSuccessNavigate) navigate(onSuccessNavigate);
    },
    onError: (err: any) => {
      setHookFormErrors(err, toast, t, i18n.language as localeType, setError);
    }
  });

  const onSubmit = handleSubmit(async (values: TForm) => {
    if (mode === "create") {
      await createMutation.mutateAsync(values);
    } else if (mode === "edit") {
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

      case "toggle":
        return (
          <div key={name}>
            <FieldGroup
              key={name}
              label={toUpperCase(t(label as string))}
              value={String(watchedValue ?? "")}
              onChange={(v) =>
                form.setValue(
                  name as Path<TForm>,
                  toBool(v) as unknown as PathValue<TForm, Path<TForm>>
                )
              }
            />
          </div>
        );

      case "media":
        return (
          <FormSection key={name} title={toUpperCase(t(label as string))}>
            <MediaUploader
              value={watchedValue ?? null}
              onChange={(v) =>
                form.setValue(
                  name as Path<TForm>,
                  v as unknown as PathValue<TForm, Path<TForm>>
                )
              }
              {...(f.props || {})}
            />
          </FormSection>
        );

      default:
        return null;
    }
  };

  const leftSections = sections.left ?? [];
  const rightSections = sections.right ?? [];

  const translationsValues = (locale: string) =>
    (form.getValues() as any).translations?.[locale] ?? {};

  const titleKey = `${resourceName}.form.${mode}Title`;
  const subtitleKey = `${resourceName}.form.subtitle`;

  const actionBarElement = (
    <ActionBar
      mode={mode}
      isSubmitting={isSubmitting}
      onCancel={() =>
        onSuccessNavigate ? navigate(onSuccessNavigate) : navigate(-1)
      }
      onDelete={
        mode === "edit" && deleteEntity
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
        headerActions={
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
        }
        actionBar={actionBarElement}
      >
        <TwoColumnLayout
          left={
            <>
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
                  />
                </div>
              </FormSection>

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
