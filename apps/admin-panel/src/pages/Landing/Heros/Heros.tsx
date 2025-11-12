import { motion } from "framer-motion";
import { Badge, Button, DataTable, Skeleton } from "@/components/ui";
import { useGetHeros } from "@/libs/queries";
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
import { Column, FilterConfig } from "@/types/ui";
import { Hero } from "@/types/website";

const Heros = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetHeros(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "active",
      label: toUpperCase(t("heros.filters.status")),
      type: "select",
      options: [
        { label: toUpperCase(t("heros.active")), value: "true" },
        { label: toUpperCase(t("heros.inactive")), value: "false" }
      ]
    },
    {
      key: "logo",
      label: toUpperCase(t("heros.filters.hasImage")),
      type: "select",
      options: [
        { label: toUpperCase(t("heros.filters.hasImage")), value: "true" },
        { label: toUpperCase(t("heros.filters.noImage")), value: "false" }
      ]
    },
    {
      key: "experience",
      label: toUpperCase(t("heros.filters.hasExperience")),
      type: "select",
      options: [
        {
          label: toUpperCase(t("heros.filters.hasExperience")),
          value: "true"
        },
        {
          label: toUpperCase(t("heros.filters.noExperience")),
          value: "false"
        }
      ]
    },
    {
      key: "visits",
      label: toUpperCase(t("heros.filters.hasVisits")),
      type: "select",
      options: [
        {
          label: toUpperCase(t("heros.filters.hasVisits")),
          value: "true"
        },
        {
          label: toUpperCase(t("heros.filters.noVisits")),
          value: "false"
        }
      ]
    }
  ];

  const columns: Column<Hero>[] = [
    {
      key: "hero",
      label: toUpperCase(t("heros.hero")),
      render: (item) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
              {item.logo ? (
                <img
                  src={getFileUrl(item.logo.path)}
                  alt={tr.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-muted-foreground h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {tr.name}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {tr.headline}
              </div>
            </div>
          </div>
        );
      },
      mobileLabel: toUpperCase(t("heros.name"))
    },
    {
      key: "position",
      label: toUpperCase(t("heros.position")),
      render: (item) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return <span className="text-foreground">{tr.position}</span>;
      }
    },
    {
      key: "experience",
      label: toUpperCase(t("heros.experience")),
      render: (item) =>
        item.experience ? (
          <Badge variant="secondary" className="px-3 py-1">
            {item.experience}
          </Badge>
        ) : (
          ""
        ),
      className: "text-center"
    },

    {
      key: "visits",
      label: toUpperCase(t("heros.visits")),
      render: (item) =>
        item.visits ? (
          <Badge variant="secondary" className="px-3 py-1">
            {item.visits}
          </Badge>
        ) : (
          ""
        ),
      className: "text-center"
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("heros.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "active",
      label: toUpperCase(t("heros.status")),
      sortable: true,
      render: (item) => (
        <Badge
          variant={item.active ? "default" : "outline"}
          className="px-3 py-1"
        >
          {item.active
            ? toUpperCase(t("heros.active"))
            : toUpperCase(t("heros.inactive"))}
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
            {toUpperCase(t("heros.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("heros.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/heros/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("heros.addHero"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="hero"
        filters={filters}
        total={data?.count}
        editUrl="/landing/heros/edit"
        emptyMessage={toUpperCase(t("heros.noHerosFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div>
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                    <Skeleton className="h-12 w-12" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("heros.position"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("heros.status"))}
                    </span>
                    <div className="mt-1 flex justify-end">
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("heros.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("heros.created"))}
                    </span>
                    <div className="mt-1 text-sm">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          const tr = getTranslatedObject(item?.translations, i18n.language);
          return (
            <div>
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                  {item?.logo ? (
                    <img
                      src={getFileUrl(item?.logo.path)}
                      alt={tr?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-semibold">{tr?.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {tr?.headline}
                  </p>
                </div>
              </div>
              <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("heros.position"))}
                  </span>
                  <p className="mt-1 font-medium">{tr?.position}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("heros.status"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant={item?.active ? "default" : "outline"}>
                      {item?.active
                        ? toUpperCase(t("heros.active"))
                        : toUpperCase(t("heros.inactive"))}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("heros.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item?.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("heros.created"))}
                  </span>
                  <p className="mt-1 text-sm">
                    {formatDate(item?.createdAt, i18n.language, true)}
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

export const HerosNavigationRoute = {
  element: <Heros />,
  path: "/landing/heros"
};

export default Heros;
