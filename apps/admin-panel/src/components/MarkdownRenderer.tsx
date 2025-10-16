import React, { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import { marked } from "marked";
import TurndownService from "turndown";
import ReactMarkdown from "react-markdown";
import * as Dialog from "@radix-ui/react-dialog";
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  List,
  ListOrdered,
  Eye,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface MarkdownEditorProps<TForm extends FieldValues = FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm> | string;
  label?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  onUpload?: (file: File) => Promise<string>;
}

export function MarkdownEditor<TForm extends FieldValues = FieldValues>({
  form,
  name,
  label,
  disabled = false,
  className,
  placeholder,
  onUpload
}: MarkdownEditorProps<TForm>) {
  const { t } = useTranslation();
  const turndown = useMemo(
    () => new TurndownService({ headingStyle: "atx" }),
    []
  );
  const [mode, setMode] = useState<"editor" | "source" | "preview">("editor");
  const [source, setSource] = useState<string>("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const getFormValue = () => {
    return form.getValues()[name as any] ?? "";
  };

  const initialHTML = useMemo(() => {
    try {
      const val = getFormValue();
      return val ? marked(String(val)) : "";
    } catch (e) {
      return "";
    }
  }, []);

  const editor = useEditor({
    editable: !disabled && mode === "editor",
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      CodeBlock
    ],
    content: initialHTML,
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        const md = turndown.turndown(html);
        form.setValue(
          name as any,
          md as unknown as PathValue<TForm, Path<TForm>>,
          {
            shouldDirty: true,
            shouldTouch: true
          }
        );
      } catch (err) {
        //
      }
    }
  });

  useEffect(() => {
    const subscription = form.watch((newValues) => {
      const externalVal = newValues?.[name as any];
      if (externalVal == null) return;
      try {
        const currentMd = turndown.turndown(editor?.getHTML() ?? "");
        if (String(currentMd) !== String(externalVal)) {
          const html = marked(String(externalVal));
          editor?.commands.setContent(html, { emitUpdate: false });
        }
      } catch (e) {
        //
      }
    });
    return () => subscription.unsubscribe();
  }, [form, name, editor, turndown]);

  useEffect(() => {
    if (mode === "source") {
      const html = editor?.getHTML() ?? "";
      setSource(turndown.turndown(html));
    }
  }, [mode, editor, turndown]);

  const applySourceToEditor = async (s: string) => {
    const html = marked(s || "");
    editor?.commands.setContent(html, { emitUpdate: true });
    form.setValue(name as any, s as unknown as PathValue<TForm, Path<TForm>>, {
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const onImageFile = async (file?: File) => {
    if (!file) return;
    try {
      setImageUploading(true);
      let url: string;
      if (onUpload) {
        url = await onUpload(file);
      } else {
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
      const html = editor?.getHTML() ?? "";
      form.setValue(
        name as any,
        turndown.turndown(html) as unknown as PathValue<TForm, Path<TForm>>,
        {
          shouldDirty: true,
          shouldTouch: true
        }
      );
      setImageDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setImageUploading(false);
    }
  };

  const toolbarButton = (
    onClick: () => void,
    active?: boolean,
    title?: string,
    children?: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors focus-visible:ring ${active ? "bg-muted" : "bg-transparent"}`}
    >
      {children}
    </button>
  );

  const renderedMarkdown = String(getFormValue() ?? "");

  return (
    <div className={className}>
      {label && (
        <label className="text-muted-foreground mb-2 block text-sm font-medium">
          {t(label as string)}
        </label>
      )}

      <div className="mb-2 flex items-center gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("editor")}
            className={`rounded-md px-3 py-1 ${mode === "editor" ? "bg-primary/10" : "bg-transparent"}`}
          >
            {t("editor.mode.editor")}
          </button>
          <button
            type="button"
            onClick={() => setMode("source")}
            className={`rounded-md px-3 py-1 ${mode === "source" ? "bg-primary/10" : "bg-transparent"}`}
          >
            {t("editor.mode.source")}
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-md px-3 py-1 ${mode === "preview" ? "bg-primary/10" : "bg-transparent"}`}
          >
            {t("editor.mode.preview")}
          </button>
        </div>
      </div>

      <div className="bg-card mb-2 rounded-md border p-2">
        {mode === "editor" && (
          <div className="mb-2 flex flex-wrap gap-2">
            {toolbarButton(
              () => editor?.chain().focus().toggleBold().run(),
              editor?.isActive("bold"),
              t("toolbar.bold"),
              <Bold className="h-4 w-4" />
            )}
            {toolbarButton(
              () => editor?.chain().focus().toggleItalic().run(),
              editor?.isActive("italic"),
              t("toolbar.italic"),
              <Italic className="h-4 w-4" />
            )}
            {toolbarButton(
              () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              editor?.isActive("heading", { level: 2 }),
              t("toolbar.h2"),
              <FileText className="h-4 w-4" />
            )}
            {toolbarButton(
              () => editor?.chain().focus().toggleBulletList().run(),
              editor?.isActive("bulletList"),
              t("toolbar.bulletList"),
              <List className="h-4 w-4" />
            )}
            {toolbarButton(
              () => editor?.chain().focus().toggleOrderedList().run(),
              editor?.isActive("orderedList"),
              t("toolbar.orderedList"),
              <ListOrdered className="h-4 w-4" />
            )}
            {toolbarButton(
              () => editor?.chain().focus().toggleCodeBlock().run(),
              editor?.isActive("codeBlock"),
              t("toolbar.codeBlock"),
              <Code className="h-4 w-4" />
            )}

            <button
              type="button"
              onClick={() => setImageDialogOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border px-2 text-sm"
              title={t("toolbar.insertImage")}
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const url = prompt(t("prompt.enterUrlToLinkTo"));
                if (!url) return;
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border px-2 text-sm"
              title={t("toolbar.insertLink")}
            >
              <LinkIcon className="h-4 w-4" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const html = editor?.getHTML() ?? "";
                  const md = turndown.turndown(html);
                  form.setValue(
                    name as any,
                    md as unknown as PathValue<TForm, Path<TForm>>,
                    {
                      shouldDirty: true,
                      shouldTouch: true
                    }
                  );
                  setMode("preview");
                }}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1"
              >
                <Eye className="h-4 w-4" /> {t("toolbar.preview")}
              </button>
            </div>
          </div>
        )}

        <div className="bg-background min-h-[180px] rounded-md px-3 py-2">
          {mode === "editor" && (
            <div
              className={`${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <EditorContent editor={editor} />
            </div>
          )}

          {mode === "source" && (
            <textarea
              className="min-h-[240px] w-full resize-y rounded-md border p-3 font-mono text-sm"
              value={source}
              placeholder={placeholder ? t(placeholder as string) : undefined}
              onChange={(e) => setSource(e.target.value)}
              onBlur={() => applySourceToEditor(source)}
              disabled={disabled}
            />
          )}

          {mode === "preview" && (
            <div className="prose max-w-none">
              <ReactMarkdown>{renderedMarkdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <Dialog.Root open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(800px,95%)] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="mb-2 text-lg font-semibold">
              {t("insertImage.title")}
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground mb-4 text-sm">
              {t("insertImage.description")}
            </Dialog.Description>

            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageFile(e.target.files?.[0])}
                />
              </div>

              <div className="flex w-56 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) {
                      editor?.chain().focus().setImage({ src: url }).run();
                      const html = editor?.getHTML() ?? "";
                      form.setValue(
                        name as any,
                        turndown.turndown(html) as unknown as PathValue<
                          TForm,
                          Path<TForm>
                        >,
                        {
                          shouldDirty: true,
                          shouldTouch: true
                        }
                      );
                      setImageDialogOpen(false);
                    }
                  }}
                  className="rounded-md border px-3 py-1"
                >
                  {t("insertImage.insertFromUrl")}
                </button>
                <button
                  type="button"
                  onClick={() => setImageDialogOpen(false)}
                  className="rounded-md border px-3 py-1"
                >
                  {t("insertImage.cancel")}
                </button>
              </div>
            </div>

            {imageUploading && (
              <div className="mt-4 text-sm"> {t("insertImage.uploading")}</div>
            )}

            <Dialog.Close className="sr-only">
              {" "}
              {t("insertImage.close")}
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
