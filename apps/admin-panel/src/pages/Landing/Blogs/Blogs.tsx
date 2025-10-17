import { motion } from "framer-motion";
import { Badge, Button, DataTable } from "@/components/ui";
import { useGetBlogs, useGetBlogsFilterOptions } from "@/libs/queries";
import {
  formatDate,
  getFileUrl,
  getPaginationFields,
  getTranslatedObject,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageIcon, Plus, Star, Tag } from "lucide-react";
import { Column, FilterConfig } from "@/types/ui";
import { Blog } from "@/types/website";
import { cn } from "@/libs";
import { useMemo, useState, useCallback } from "react";

const Blogs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetBlogs(filledSearchParams);

  const [filterSearchParams, setFilterSearchParams] = useState<
    Record<string, string>
  >({});

  const handleUsersSearch = useCallback((q: string) => {
    setFilterSearchParams((prev) => {
      const next = { ...prev, users: q ?? "" };
      if ((prev.users ?? "") === (next.users ?? "")) return prev;
      return next;
    });
  }, []);

  const filterQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", "0");
    p.set("pageSize", "10");
    Object.entries(filterSearchParams).forEach(([k, v]) => {
      if (v && v.trim() !== "") {
        p.set("search", v);
      }
    });
    return p;
  }, [filterSearchParams]);

  const { data: filterOptions } = useGetBlogsFilterOptions(
    i18n.language as "en" | "ka",
    filterQuery
  );

  const filters: FilterConfig[] = useMemo(() => {
    return [
      {
        key: "showInLanding",
        label: toUpperCase(t("blogs.filters.showInLanding")),
        type: "select",
        options: [
          { label: toUpperCase(t("blogs.yes")), value: "true" },
          { label: toUpperCase(t("blogs.no")), value: "false" }
        ]
      },
      {
        key: "withMeta",
        label: toUpperCase(t("blogs.filters.withMeta")),
        type: "select",
        options: [
          { label: toUpperCase(t("blogs.filters.withMeta")), value: "true" },
          { label: toUpperCase(t("blogs.filters.withoutMeta")), value: "false" }
        ]
      },
      {
        key: "background",
        label: toUpperCase(t("blogs.filters.hasBackground")),
        type: "select",
        options: [
          {
            label: toUpperCase(t("blogs.filters.hasBackground")),
            value: "true"
          },
          {
            label: toUpperCase(t("blogs.filters.noBackground")),
            value: "false"
          }
        ]
      },
      {
        key: "stars",
        label: toUpperCase(t("blogs.filters.stars")),
        type: "number"
      },
      {
        key: "categories",
        label: toUpperCase(t("blogs.filters.categories")),
        type: "multiple-select",
        options: filterOptions?.data?.categories?.length
          ? filterOptions?.data?.categories
          : []
      },
      {
        key: "users",
        label: toUpperCase(t("blogs.filters.users")),
        type: "multiple-select",
        withSearch: true,
        onSearchChange: handleUsersSearch,
        searchValue: filterSearchParams.users ?? "",
        options: filterOptions?.data?.users?.length
          ? filterOptions?.data?.users
          : []
      }
    ];
  }, [
    t,
    filterOptions?.data?.categories,
    filterOptions?.data?.users,
    handleUsersSearch,
    filterSearchParams.users
  ]);

  const columns: Column<Blog>[] = useMemo(
    () => [
      {
        key: "background",
        label: toUpperCase(t("blogs.background")),
        render: (item) => (
          <div className="border-border bg-muted/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
            {item.background ? (
              <img
                src={getFileUrl(item.background.path)}
                alt={item.background.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="text-muted-foreground h-6 w-6" />
            )}
          </div>
        )
      },
      {
        key: "slug",
        label: toUpperCase(t("blogs.slug")),
        render: (item) => <span className="text-foreground">{item.slug}</span>,
        sortable: true
      },
      {
        key: "translationsCount",
        label: toUpperCase(t("blogs.translations")),
        render: (item) => (
          <Badge variant="secondary" className="px-3 py-1">
            {item.translations?.length}
          </Badge>
        ),
        className: "text-center"
      },
      {
        key: "showInLanding",
        label: toUpperCase(t("blogs.showInLanding")),
        sortable: true,
        render: (item) => (
          <Badge
            variant={item.showInLanding ? "default" : "outline"}
            className="px-3 py-1"
          >
            {item.showInLanding
              ? toUpperCase(t("blogs.yes"))
              : toUpperCase(t("blogs.no"))}
          </Badge>
        ),
        className: "text-center"
      },
      {
        key: "landingOrder",
        label: toUpperCase(t("blogs.landingOrder")),
        sortable: true,
        render: (item) => (
          <Badge variant="outline" className="px-3 py-1">
            {item.landingOrder}
          </Badge>
        ),
        className: "text-center"
      },
      {
        key: "categories",
        label: toUpperCase(t("blogs.categories")),
        render: (item) => (
          <div className="flex flex-wrap gap-1">
            {item.categories.map((category, i) => {
              const tr = getTranslatedObject(
                category.translations,
                i18n.language
              );
              return (
                <Badge key={i} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tr.name}
                </Badge>
              );
            })}
          </div>
        ),
        className: "text-center"
      },
      {
        key: "stars",
        label: toUpperCase(t("blogs.stars")),
        sortable: true,
        render: (item) => (
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < item.stars
                    ? "fill-current text-yellow-500"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        ),
        className: "text-center"
      }
    ],
    [t, i18n.language]
  );

  return (
    <motion.div
      className="mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-[20px] font-semibold md:text-3xl">
            {toUpperCase(t("blogs.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("blogs.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/blogs/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("blogs.addBlog"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="blog"
        filters={filters}
        total={data?.count}
        editUrl="/landing/blogs/edit"
        emptyMessage={toUpperCase(t("blogs.noBlogsFound"))}
        mobileCardRender={(item) => {
          return (
            <article className="flex flex-col gap-3">
              <div className="bg-muted/10 relative w-full overflow-hidden rounded-md">
                {item.background ? (
                  <img
                    src={getFileUrl(item.background.path)}
                    alt={item.background.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <ImageIcon className="text-muted-foreground h-8 w-8" />
                  </div>
                )}

                {item.showInLanding && (
                  <span className="absolute top-2 left-2 rounded-md bg-yellow-500/95 px-2 py-0.5 text-xs font-medium text-white">
                    {toUpperCase(t("blogs.featured") || "Featured")}
                  </span>
                )}
                <div className="mt-2 min-w-0 flex-1">
                  <h3 className="text-foreground font-normal">{item.slug}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 items-start gap-2">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("blogs.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h4 className="text-muted-foreground mb-[10px] text-sm">
                    {toUpperCase(t("blogs.stars"))}
                  </h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < item.stars
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                {item.categories?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.categories.slice(0, 3).map((cat, i) => {
                      const cTr = getTranslatedObject(
                        cat.translations,
                        i18n.language
                      );
                      return (
                        <Badge key={i} variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {cTr.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("blogs.created"))}
                </span>
                <p className="mt-1 text-sm">
                  {formatDate(item.createdAt, i18n.language, true)}
                </p>
              </div>
            </article>
          );
        }}
      />
    </motion.div>
  );
};

export const BlogsNavigationRoute = {
  element: <Blogs />,
  path: "/landing/blogs"
};

export default Blogs;
