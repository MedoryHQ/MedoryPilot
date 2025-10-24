import { ActionBar } from "@/components/forms";
import { z } from "zod";
import { UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";

export interface TranslationField {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "number" | "markdown";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  rows?: number;
  maxLength?: number;
  helperText?: string;
}

export interface TranslationsPanelProps<T extends string = string> {
  activeLocale: T;
  fields: TranslationField[];
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "toggle"
  | "media"
  | "custom"
  | "number"
  | "email"
  | "translated-select";

export type FieldConfig<TForm extends FieldValues = FieldValues> =
  | {
      kind: "simple";
      name: string;
      label: string;
      type: FieldType;
      description?: string;
      activeLabel?: string;
      inactiveLabel?: string;
      props?: any;
    }
  | {
      kind: "custom";
      name?: string;
      label?: string;
      render: (form: UseFormReturn<TForm>) => React.ReactNode;
    };

export type SectionConfig<TForm extends FieldValues = FieldValues> = {
  key?: string;
  title?: string;
  description?: string;
  fields?: FieldConfig<TForm>[];
};

export interface GenericEntityFormProps<
  TForm extends FieldValues = FieldValues,
  TEntity = any
> {
  resourceName?: string;
  mode: "create" | "edit" | "readonly";
  id?: string | null;
  schema: z.ZodTypeAny;
  defaultValues: DefaultValues<TForm>;
  fetchEntity?: (id?: string) => Promise<TEntity>;
  createEntity?: (payload: TForm) => Promise<any>;
  updateEntity?: (id: string, payload: TForm) => Promise<any>;
  deleteEntity?: (id: string) => Promise<any>;
  translationLocales?: string[];
  translationFields?: TranslationField[];
  sections?: {
    left?: SectionConfig<TForm>[];
    right?: SectionConfig<TForm>[];
  };
  onSuccessNavigate?: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  actionBarProps?: Partial<React.ComponentProps<typeof ActionBar>>;
  mapFetchedToForm?: (entity: TEntity) => Partial<TForm>;
  renderFooter?: (form: UseFormReturn<TForm>) => React.ReactNode;
  entityData?: any;
  refetch?: () => Promise<any> | void;
  externalMode?: "create" | "edit" | "readonly";
  onModeChange?: (m: "create" | "edit" | "readonly") => void;
  allowModeToggleForReadonly?: boolean;
}
