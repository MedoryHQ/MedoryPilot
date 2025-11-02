import { motion } from "framer-motion";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useGetEducations } from "@/libs/queries";
import {
  formatDate,
  getFileUrl,
  getPaginationFields,
  getTranslatedObject,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable } from "@/components/ui";
import { Education } from "@/types/website";
import { Column, FilterConfig } from "@/types/ui";

const Educations = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetEducations(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "icon",
      label: toUpperCase(t("educations.filters.hasIcon")),
      type: "select",
      options: [
        { label: toUpperCase(t("educations.filters.hasIcon")), value: "true" },
        { label: toUpperCase(t("educations.filters.noIcon")), value: "false" }
      ]
    },
    {
      key: "link",
      label: toUpperCase(t("educations.filters.hasLink")),
      type: "select",
      options: [
        { label: toUpperCase(t("educations.filters.hasLink")), value: "true" },
        { label: toUpperCase(t("educations.filters.noLink")), value: "false" }
      ]
    },
    {
      key: "dateRange",
      label: toUpperCase(t("educations.filters.dateRange") || "Date range"),
      type: "date-range"
    }
  ];

  const columns: Column<Education>[] = [
    {
      key: "education",
      label: toUpperCase(t("educations.education")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
              {item.icon ? (
                <img
                  src={getFileUrl(item.icon.path)}
                  alt={item.icon.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-muted-foreground h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {toUpperCase(translation.name)}
              </div>
              <div className="text-muted-foreground mt-1 line-clamp-3 hidden max-w-[350px] text-sm md:block">
                {toUpperCase(translation.description)}
              </div>
            </div>
          </div>
        );
      },

      mobileLabel: toUpperCase(t("educations.name"))
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("educations.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "link",
      label: toUpperCase(t("educations.link")),
      sortable: true,
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <a
            className="text-accent !underline"
            href={item.link}
            target="_blank"
          >
            {toUpperCase(translation?.name)}
          </a>
        );
      }
    },
    {
      key: "degree",
      label: toUpperCase(t("educations.degree")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="text-sm">{toUpperCase(translation?.degree)}</div>
        );
      }
    },
    {
      key: "fromDate",
      label: toUpperCase(t("educations.from") || "From"),
      render: (item) =>
        item.fromDate ? (
          <div className="text-sm">
            {formatDate(item.fromDate, i18n.language)}
          </div>
        ) : (
          ""
        ),
      className: "text-left",
      sortable: true
    },
    {
      key: "endDate",
      label: toUpperCase(t("educations.to") || "To"),
      render: (item) =>
        item.endDate ? (
          <div className="text-sm">
            {formatDate(item.endDate, i18n.language)}
          </div>
        ) : (
          toUpperCase(t("educations.present"))
        ),
      className: "text-left",
      sortable: true
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
            {toUpperCase(t("educations.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("educations.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/educations/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("educations.addEducation"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="education"
        filters={filters}
        total={data?.count}
        editUrl="/landing/educations/edit"
        emptyMessage={toUpperCase(t("educations.noEducationsFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div className="px-3 py-4">
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/10 mb-0 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>

                <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("educations.name"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("educations.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("educations.created"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const translation = getTranslatedObject(
            item.translations,
            i18n.language
          );

          return (
            <div className="px-3 py-4">
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  {item.icon ? (
                    <img
                      src={getFileUrl(item.icon.path)}
                      alt={item.icon.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-7 w-7" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-foreground truncate font-medium">
                      {toUpperCase(translation?.name || "")}
                    </h3>
                  </div>

                  {translation?.description ? (
                    <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                      {toUpperCase(translation.description)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("educations.name"))}
                  </span>
                  <p className="mt-1 truncate font-medium">
                    {toUpperCase(translation?.name)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-xs">
                    {toUpperCase(t("educations.degree"))}
                  </span>
                  <div className="mt-1 text-sm font-medium">
                    {toUpperCase(translation?.degree || "-")}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("educations.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary" className="px-3 py-1">
                      {item.translations?.length ?? 0}
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("educations.created"))}
                  </span>
                  <p className="mt-1 text-sm">
                    {formatDate(item.createdAt, i18n.language, true)}
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      />
    </motion.div>
  );
};

export const EducationsNavigationRoute = {
  element: <Educations />,
  path: "/landing/educations"
};

export default Educations;
