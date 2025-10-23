import React, { useMemo, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import ReactDOMServer from "react-dom/server";
import "react-quill/dist/quill.snow.css";
import { Box, Minus } from "lucide-react";
import { ADMIN_API_PATH, VITE_API_URL } from "@/utils";

try {
  const icons = (ReactQuill as any).Quill.import("ui/icons");
  icons["hr"] = ReactDOMServer.renderToString(<Minus />);
  icons["customDiv"] = ReactDOMServer.renderToString(<Box />);
} catch {
  //
}

const Block = Quill.import("blots/block");

class DividerBlot extends Block {
  static create() {
    const node = super.create();
    node.setAttribute("class", "custom-divider");
    return node;
  }
}
DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";

try {
  Quill.register(DividerBlot);
} catch {
  //
}

class CustomDivBlot extends Block {
  static create(value: any) {
    const node = super.create();
    node.setAttribute("class", "custom-class");
    if (value) node.setAttribute("data-id", String(value));
    return node;
  }
  static formats(node: any) {
    return node.getAttribute("data-id");
  }
}
CustomDivBlot.blotName = "customDiv";
CustomDivBlot.tagName = "div";

try {
  Quill.register(CustomDivBlot);
} catch {
  //
}

type MaybeForm =
  | {
      setValue?: (...args: any[]) => any;
      getValues?: (...args: any[]) => any;
      watch?: (...args: any[]) => any;
      getFieldValue?: (...args: any[]) => any;
      setFieldsValue?: (...args: any[]) => any;
    }
  | undefined;

export function MarkdownEditor({
  name,
  form,
  disabled,
  value,
  label,
  className,
  onChange,
  onUpload
}: {
  name?: any | any[];
  label?: React.ReactNode;
  className?: string;
  form?: MaybeForm;
  value?: string;
  disabled?: boolean;
  onChange?: (html: string) => void;
  onUpload?: (file: File) => Promise<string>;
}) {
  const quillRef = useRef<ReactQuill | null>(null);
  const currentContent = useMemo(() => {
    if (typeof value === "string") return value ?? "";
    if (!form || name === undefined) return "";
    if (typeof form.getValues === "function") {
      try {
        const all = form.getValues();
        if (typeof name === "string") return all?.[name] ?? "";
        try {
          return (form as any).getValues(name as any) ?? "";
        } catch {
          return "";
        }
      } catch {
        try {
          return (form as any).getValues(name as any) ?? "";
        } catch {
          return "";
        }
      }
    }
    if (typeof (form as any).getFieldValue === "function") {
      try {
        return (form as any).getFieldValue(name as any) ?? "";
      } catch {
        return "";
      }
    }
    return "";
  }, [value, form, name]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" }
          ],
          ["link", "image"],
          ["clean"],
          ["hr"],
          ["customDiv"]
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.style.position = "fixed";
            input.style.left = "-9999px";
            document.body.appendChild(input);
            input.click();
            input.onchange = async () => {
              try {
                const file = input.files?.[0];
                if (!file) {
                  document.body.removeChild(input);
                  return;
                }
                let url: string | undefined;
                if (onUpload) {
                  url = await onUpload(file);
                } else {
                  const fd = new FormData();
                  fd.append("file", file);
                  const resp = await fetch(`${ADMIN_API_PATH}/upload/single`, {
                    method: "POST",
                    body: fd
                  });
                  const json = await resp.json();
                  url = `${VITE_API_URL as string}/${json?.file?.path}`;
                }
                const quill = quillRef.current?.getEditor();
                if (quill && url) {
                  const range = quill.getSelection();
                  quill.insertEmbed(
                    range?.index ?? quill.getLength(),
                    "image",
                    url
                  );
                }
              } catch (err) {
                console.error("image upload failed", err);
              } finally {
                try {
                  document.body.removeChild(input);
                } catch {
                  //
                }
              }
            };
          },
          hr: () => {
            const quill = quillRef.current?.getEditor();
            if (!quill) return;
            const range = quill.getSelection();
            const idx = range?.index ?? quill.getLength();
            quill.insertText(idx, "\n", "user");
            quill.insertEmbed(idx + 1, "divider", true);
            quill.insertText(idx + 2, "\n", "user");
          },
          customDiv: () => {
            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection();
            if (range && quill) {
              const id = Date.now().toString();
              const idx = range.index;
              quill.insertText(idx, "\n", "user");
              quill.insertEmbed(idx + 1, "customDiv", id);
              quill.setSelection(idx + 2, 0);
            }
          }
        }
      },
      keyboard: {
        bindings: {
          customDivEnter: {
            key: 13,
            format: ["customDiv"],
            handler: function (range: any) {
              const quill = quillRef.current?.getEditor();
              if (!quill) return true;
              const [leaf] = quill.getLeaf(range.index) as any;
              const customDiv = leaf?.parent;
              if (customDiv && customDiv.statics?.blotName === "customDiv") {
                const content = customDiv.domNode.innerHTML;
                const newlineCount = (content.match(/\n/g) || []).length;
                quill.insertEmbed(
                  range.index,
                  "text",
                  newlineCount === 0 ? "\n\n" : "\n",
                  "user"
                );
                quill.setSelection(range.index + 1, 0);
                return false;
              }
              return true;
            }
          }
        }
      }
    }),
    [onUpload]
  );

  const updateExternal = (html: string) => {
    if (typeof onChange === "function" && value !== undefined) {
      onChange(html);
      return;
    }

    if (!form || name === undefined) return;

    if (typeof (form as any).setValue === "function") {
      if (typeof name === "string") {
        (form as any).setValue(name as any, html, {
          shouldDirty: true,
          shouldTouch: true
        });
        return;
      }
      if (Array.isArray(name) && name.length === 3) {
        const [listName, lang, fieldName] = name;
        const all = (form as any).getValues();
        const currentLangValue = all?.[listName]?.[lang] ?? {};
        const newCurrentLangValue = { ...currentLangValue, [fieldName]: html };
        (form as any).setValue(
          listName,
          { ...(all?.[listName] ?? {}), [lang]: newCurrentLangValue },
          { shouldDirty: true, shouldTouch: true }
        );
        return;
      }
      if (Array.isArray(name) && name.length === 5) {
        const [listName, lang, nestedListName, index, fieldName] = name;
        const all = (form as any).getValues();
        const currentLang = all?.[listName]?.[lang] ?? {};
        const nested = currentLang?.[nestedListName] ?? [];
        const newNested = nested.map((it: any, i: number) =>
          i === Number(index) ? { ...it, [fieldName]: html } : it
        );
        (form as any).setValue(
          listName,
          {
            ...(all?.[listName] ?? {}),
            [lang]: { ...currentLang, [nestedListName]: newNested }
          },
          { shouldDirty: true, shouldTouch: true }
        );
        return;
      }
      try {
        (form as any).setValue(name as any, html, {
          shouldDirty: true,
          shouldTouch: true
        });
      } catch {
        //
      }
      return;
    }

    if (typeof (form as any).setFieldsValue === "function") {
      if (typeof name === "string") {
        (form as any).setFieldsValue({ [name]: html });
        return;
      }
      if (Array.isArray(name) && name.length === 3) {
        const [listName, lang, fieldName] = name;
        const cur = (form as any).getFieldValue([listName, lang]) ?? {};
        const newCur = { ...cur, [fieldName]: html };
        const whole = (form as any).getFieldValue(listName) ?? {};
        (form as any).setFieldsValue({
          [listName]: { ...whole, [lang]: newCur }
        });
        return;
      }
      if (Array.isArray(name) && name.length === 5) {
        const [listName, lang, nestedListName, index, fieldName] = name;
        const cur = (form as any).getFieldValue([listName, lang]) ?? {};
        const nested = cur[nestedListName] ?? [];
        const newNested = nested.map((it: any, i: number) =>
          i === Number(index) ? { ...it, [fieldName]: html } : it
        );
        const whole = (form as any).getFieldValue(listName) ?? {};
        (form as any).setFieldsValue({
          [listName]: {
            ...whole,
            [lang]: { ...cur, [nestedListName]: newNested }
          }
        });
        return;
      }
      try {
        (form as any).setFieldsValue({ [name]: html });
      } catch {
        //
      }
    }
  };

  const handleChange = (content: string) => {
    updateExternal(content);
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const editorHtml = quill.root.innerHTML ?? "";
    if (currentContent != null && typeof currentContent === "string") {
      if (currentContent !== editorHtml) {
        try {
          quill.root.innerHTML = currentContent;
        } catch {
          //
        }
      }
    }
  }, [currentContent]);

  return (
    <div className={className ?? ""}>
      {label && (
        <div className="text-foreground mb-2 text-sm font-medium">{label}</div>
      )}

      <ReactQuill
        theme="snow"
        modules={modules}
        ref={quillRef}
        readOnly={disabled}
        onChange={handleChange}
        value={currentContent}
        style={{ width: "100%" }}
      />
    </div>
  );
}

export default MarkdownEditor;
