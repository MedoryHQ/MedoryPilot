import { cn, toUpperCase } from "@/utils";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string | undefined;
  classNames?: {
    a?: string;
    span?: string;
    strong?: string;
    p?: string;
    img?: string;
    iframe?: string;
    ul?: string;
    li?: string;
    ol?: string;
    h2?: string;
    h1?: string;
  };
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  classNames,
  ...props
}) => {
  const locale = useLocale();
  return (
    <div className={cn(props.className, "markdown")}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              href={props.href?.toLowerCase()}
              className={cn(
                "text-primary underline transition-all duration-300 cursor-pointer bg-transparent!",
                classNames?.a
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.children}
            </a>
          ),
          span: ({ ...props }) => {
            if (typeof props.children === "string") {
              return (
                <span
                  {...props}
                  className={cn("text-white-primary!", classNames?.span)}
                >
                  {toUpperCase(props.children)}
                </span>
              );
            }
            return (
              <span
                {...props}
                className={cn("text-white-primary!", classNames?.span)}
              >
                {props.children}
              </span>
            );
          },
          pre: ({ children }) => {
            let codeElement: React.ReactElement | null = null;

            if (Array.isArray(children)) {
              codeElement = children.find(
                (child) => isValidElement(child) && child.type === "code"
              ) as React.ReactElement | null;
            } else if (isValidElement(children) && children.type === "code") {
              codeElement = children as React.ReactElement;
            }

            let codeString = "";
            let className = "";
            if (codeElement) {
              const { className: codeClassName = "", children: codeChildren } =
                codeElement.props as {
                  className?: string;
                  children?: React.ReactNode;
                };
              className = codeClassName;
              codeString = String(codeChildren ?? "");
            } else if (Array.isArray(children)) {
              codeString = children
                .filter((c) => typeof c === "string")
                .join("");
            } else if (typeof children === "string") {
              codeString = children;
            }

            const language =
              className.match(/language-(\w+)/)?.[1] || "plaintext";

            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{
                  borderRadius: "8px",
                  padding: "1em",
                  fontSize: "1em",
                  margin: "1em 0",
                }}
                showLineNumbers
                wrapLongLines
              >
                {codeString.replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
          strong: ({ ...props }) => {
            if (typeof props.children === "string") {
              return (
                <strong
                  {...props}
                  className={cn(
                    "text-white-primary! font-bold",
                    classNames?.strong
                  )}
                >
                  {toUpperCase(props.children)}
                </strong>
              );
            }
            return (
              <strong
                {...props}
                className={cn(
                  "text-white-primary! font-bold",
                  classNames?.strong
                )}
              >
                {props.children}
              </strong>
            );
          },
          p: ({ children, ...props }) => {
            const processChildren = (
              children: React.ReactNode
            ): React.ReactNode => {
              return React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return toUpperCase(child);
                }

                return child;
              });
            };

            return (
              <p className={cn(classNames?.p)} {...props}>
                {processChildren(children)}
              </p>
            );
          },
          img: ({ ...props }) =>
            props.src ? (
              <Image
                {...props}
                src={props.src as string}
                alt={props.alt || "Markdown Image"}
                width={500}
                height={300}
                className={cn("max-w-full h-auto", classNames?.img)}
              />
            ) : (
              ""
            ),

          iframe: ({ ...props }) => {
            const isYouTube =
              props.src?.includes("youtube.com") ||
              props.src?.includes("youtu.be");

            return (
              <div
                className={cn(
                  "relative aspect-video w-full my-4 ",
                  classNames?.iframe
                )}
              >
                <iframe
                  {...props}
                  className={cn(
                    "absolute top-0 left-0 w-full h-full rounded-lg",
                    isYouTube && "aspect-video",
                    classNames?.iframe
                  )}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            );
          },
          ul: ({ ...props }) => (
            <ul
              {...props}
              className={cn("list-disc! list-outside", classNames?.ul)}
            >
              {props.children}
            </ul>
          ),
          li: ({ ...props }) => (
            <li
              {...props}
              className={cn(
                "text-[14px] md:text-[18px] ml-5 md:mb-1 md:pl-1 text-white-primary",
                classNames?.li
              )}
            >
              {props.children}
            </li>
          ),
          ol: ({ ...props }) => (
            <ol
              {...props}
              className={cn(
                "text-[14px] md:text-[18px] text-decimal ml-5 md:mb-1 md:pl-1 text-white-primary",
                classNames?.ol
              )}
            >
              {props.children}
            </ol>
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className={cn(
                "text-[23px] md:text-[26px] mb-2 text-primary",
                classNames?.h2
              )}
            >
              {props.children}
            </h2>
          ),
          h1: ({ ...props }) => (
            <h1
              {...props}
              className={cn(
                "text-primary mb-4 font-bold md:leading-12",
                locale === "en"
                  ? "text-[30px] leading-11 md:text-[32px]"
                  : "text-[28px] leading-[42px] md:text-[31px]",
                classNames?.h1
              )}
            >
              {props.children}
            </h1>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
};
