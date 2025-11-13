import { motion } from "framer-motion";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useGetServices } from "@/libs/queries";
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
import { Service } from "@/types/website";
import { Column, FilterConfig } from "@/types/ui";

const Services = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetServices(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "icon",
      label: toUpperCase(t("services.filters.hasIcon")),
      type: "select",
      options: [
        { label: toUpperCase(t("services.filters.hasIcon")), value: "true" },
        { label: toUpperCase(t("services.filters.noIcon")), value: "false" }
      ]
    }
  ];

  const columns: Column<Service>[] = [
    {
      key: "service",
      label: toUpperCase(t("services.service")),
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
                {toUpperCase(translation.title)}
              </div>
              <div className="text-muted-foreground mt-1 line-clamp-3 hidden max-w-[350px] text-sm md:block">
                {toUpperCase(translation.description)}
              </div>
            </div>
          </div>
        );
      },

      mobileLabel: toUpperCase(t("services.name"))
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("services.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "visits",
      label: toUpperCase(t("services.visits")),
      render: (item) => (
        <Badge variant="default" className="px-3 py-1">
          {item._count.visits}
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
            {toUpperCase(t("services.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("services.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/services/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("services.addService"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="service"
        filters={filters}
        total={data?.count}
        editUrl="/landing/services/edit"
        emptyMessage={toUpperCase(t("services.noServicesFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div>
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-15 w-3/4" />
                  </div>
                </div>

                <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("services.title"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("services.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("services.visits"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-6 w-14" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("services.created"))}
                    </span>
                    <p className="mt-1 text-sm">
                      <Skeleton className="h-4 w-32" />
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          const translation = getTranslatedObject(
            item?.translations,
            i18n.language
          );
          return (
            <div>
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                  {item?.icon ? (
                    <img
                      src={getFileUrl(item?.icon.path)}
                      alt={item?.icon.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-semibold">
                    {translation?.title}
                  </h3>
                </div>
              </div>
              <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("services.title"))}
                  </span>
                  <p className="mt-1 font-medium">{translation?.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("services.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item?.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("services.visits"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="default" className="px-3 py-1">
                      {item?._count.visits}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("services.created"))}
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

export const ServicesNavigationRoute = {
  element: <Services />,
  path: "/landing/services"
};

export default Services;
