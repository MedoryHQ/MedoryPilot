import { motion } from "framer-motion";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useGetExperiences } from "@/libs/queries";
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
import { Experience } from "@/types/website";
import { Column, FilterConfig } from "@/types/ui";

const Experiences = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetExperiences(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "icon",
      label: toUpperCase(t("experiences.filters.hasIcon")),
      type: "select",
      options: [
        { label: toUpperCase(t("experiences.filters.hasIcon")), value: "true" },
        { label: toUpperCase(t("experiences.filters.noIcon")), value: "false" }
      ]
    },
    {
      key: "link",
      label: toUpperCase(t("experiences.filters.hasLink")),
      type: "select",
      options: [
        { label: toUpperCase(t("experiences.filters.hasLink")), value: "true" },
        { label: toUpperCase(t("experiences.filters.noLink")), value: "false" }
      ]
    },
    {
      key: "location",
      label: toUpperCase(t("experiences.filters.hasLocation")),
      type: "select",
      options: [
        {
          label: toUpperCase(t("experiences.filters.hasLocation")),
          value: "true"
        },
        {
          label: toUpperCase(t("experiences.filters.noLocation")),
          value: "false"
        }
      ]
    },
    {
      key: "dateRange",
      label: toUpperCase(t("experiences.filters.dateRange") || "Date range"),
      type: "date-range"
    }
  ];

  const columns: Column<Experience>[] = [
    {
      key: "experience",
      label: toUpperCase(t("experiences.experience")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
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
            <div className="text-foreground truncate font-medium">
              {toUpperCase(translation.name)}
            </div>
          </div>
        );
      },

      mobileLabel: toUpperCase(t("experiences.name"))
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("experiences.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "link",
      label: toUpperCase(t("experiences.link")),
      sortable: true,
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        if (!item.link) {
          return "";
        }
        return (
          <a
            className="text-accent underline!"
            href={item.link}
            target="_blank"
          >
            {toUpperCase(translation?.name)}
          </a>
        );
      }
    },
    {
      key: "position",
      label: toUpperCase(t("experiences.position")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="text-sm">{toUpperCase(translation?.position)}</div>
        );
      }
    },
    {
      key: "location",
      label: toUpperCase(t("experiences.location")),
      sortable: true,
      render: (item) => {
        return (
          <div className="text-sm">{toUpperCase(item?.location || "")}</div>
        );
      }
    },
    {
      key: "fromDate",
      label: toUpperCase(t("experiences.from") || "From"),
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
      label: toUpperCase(t("experiences.to") || "To"),
      render: (item) =>
        item.endDate ? (
          <div className="text-sm">
            {formatDate(item.endDate, i18n.language)}
          </div>
        ) : (
          toUpperCase(t("experiences.present"))
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
            {toUpperCase(t("experiences.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("experiences.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/experiences/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("experiences.addExperience"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="experience"
        filters={filters}
        total={data?.count}
        editUrl="/landing/experiences/edit"
        emptyMessage={toUpperCase(t("experiences.noExperiencesFound"))}
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
                      {toUpperCase(t("experiences.position"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("experiences.location"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("experiences.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("experiences.created"))}
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

          const from = item.fromDate
            ? formatDate(item.fromDate, i18n.language)
            : "";
          const to = item.endDate
            ? formatDate(item.endDate, i18n.language)
            : toUpperCase(t("experiences.present"));

          return (
            <div className="px-3 py-4">
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
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
                </div>
              </div>

              <div className="pt-3">
                <span className="text-muted-foreground text-xs">
                  {toUpperCase(
                    `${t("experiences.from")} - ${t("experiences.to")}`
                  )}
                </span>
                <p className="mt-1 text-sm">
                  {from} {from && "—"} {to}
                </p>
              </div>
              <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("experiences.location"))}
                  </span>
                  <p className="mt-1 truncate font-medium">
                    {toUpperCase(translation?.location || "-")}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("experiences.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary" className="px-3 py-1">
                      {item.translations?.length ?? 0}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    {toUpperCase(t("experiences.position"))}
                  </span>
                  <div className="mt-1 text-sm font-medium">
                    {toUpperCase(translation?.position || "-")}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("experiences.created"))}
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

export const ExperiencesNavigationRoute = {
  element: <Experiences />,
  path: "/landing/experiences"
};

export default Experiences;
