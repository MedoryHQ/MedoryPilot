import { motion } from "framer-motion";
import { Badge, Button, DataTable, Skeleton } from "@/components/ui";
import { useGetNewses } from "@/libs/queries";
import {
  formatDate,
  getFileUrl,
  getPaginationFields,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageIcon, Plus } from "lucide-react";
import { Column, FilterConfig } from "@/types/ui";
import { News } from "@/types/website";

const Newses = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetNewses(filledSearchParams);
  const filters: FilterConfig[] = [
    {
      key: "showInLanding",
      label: toUpperCase(t("newses.filters.showInLanding")),
      type: "select",
      options: [
        { label: toUpperCase(t("newses.yes")), value: "true" },
        { label: toUpperCase(t("newses.no")), value: "false" }
      ]
    },
    {
      key: "withMeta",
      label: toUpperCase(t("newses.filters.withMeta")),
      type: "select",
      options: [
        { label: toUpperCase(t("newses.filters.withMeta")), value: "true" },
        { label: toUpperCase(t("newses.filters.withoutMeta")), value: "false" }
      ]
    },
    {
      key: "background",
      label: toUpperCase(t("newses.filters.hasBackground")),
      type: "select",
      options: [
        {
          label: toUpperCase(t("newses.filters.hasBackground")),
          value: "true"
        },
        {
          label: toUpperCase(t("newses.filters.noBackground")),
          value: "false"
        }
      ]
    }
  ];

  const columns: Column<News>[] = [
    {
      key: "background",
      label: toUpperCase(t("newses.background")),
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
      label: toUpperCase(t("newses.slug")),
      render: (item) => <span className="text-foreground">{item.slug}</span>,
      sortable: true
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("newses.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "showInLanding",
      label: toUpperCase(t("newses.showInLanding")),
      sortable: true,
      render: (item) => (
        <Badge
          variant={item.showInLanding ? "default" : "outline"}
          className="px-3 py-1"
        >
          {item.showInLanding
            ? toUpperCase(t("newses.yes"))
            : toUpperCase(t("newses.no"))}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "order",
      label: toUpperCase(t("newses.order")),
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="px-3 py-1">
          {item.order}
        </Badge>
      ),
      className: "text-center"
    }
  ];

  return (
    <motion.div
      className="mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-[20px] font-semibold md:text-3xl">
            {toUpperCase(t("newses.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("newses.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/newses/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("newses.addNews"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        editKey="slug"
        isLoading={isFetching}
        deleteEndpoint="news"
        filters={filters}
        total={data?.count}
        editUrl="/landing/newses/edit"
        emptyMessage={toUpperCase(t("newses.noNewsesFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <article className="flex flex-col gap-3">
                <div className="relative w-full overflow-hidden rounded-md">
                  <Skeleton className="h-40 w-full" />
                </div>

                <div className="mt-2 min-w-0 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                </div>

                <div className="grid grid-cols-2 items-start gap-2">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("newses.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="inline-block h-6 w-12 rounded-md" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground mb-[10px] text-sm">
                      {toUpperCase(t("newses.created") || "Created")}
                    </span>
                    <p className="mt-1 text-sm">
                      <Skeleton className="h-4 w-28" />
                    </p>
                  </div>
                </div>
              </article>
            );
          }
          return (
            <article className="flex flex-col gap-3">
              <div className="bg-muted/10 relative w-full overflow-hidden rounded-md">
                {item?.background ? (
                  <img
                    src={getFileUrl(item?.background.path)}
                    alt={item?.background.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <ImageIcon className="text-muted-foreground h-8 w-8" />
                  </div>
                )}

                {item?.showInLanding && (
                  <span className="absolute top-2 left-2 rounded-md bg-yellow-500/95 px-2 py-0.5 text-xs font-medium text-white">
                    {toUpperCase(t("newses.inLanding") || "In Landing")}
                  </span>
                )}
                <div className="mt-2 min-w-0 flex-1">
                  <h3 className="text-foreground font-normal">{item?.slug}</h3>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("newses.translations"))}
                </span>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {item?.translations?.length}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("newses.created"))}
                </span>
                <p className="mt-1 text-sm">
                  {formatDate(item?.createdAt, i18n.language, true)}
                </p>
              </div>
            </article>
          );
        }}
      />
    </motion.div>
  );
};

export const NewsesNavigationRoute = {
  element: <Newses />,
  path: "/landing/newses"
};

export default Newses;
