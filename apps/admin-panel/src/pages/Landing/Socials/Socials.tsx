import { motion } from "framer-motion";
import { Button, Skeleton } from "@/components/ui";
import { useGetSocials } from "@/libs/queries";
import {
  formatDate,
  getFileUrl,
  getPaginationFields,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable } from "@/components/ui";
import { Social } from "@/types/website";
import { Column, FilterConfig } from "@/types/ui";

const Socials = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetSocials(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "icon",
      label: toUpperCase(t("socials.filters.hasIcon")),
      type: "select",
      options: [
        { label: toUpperCase(t("socials.filters.hasIcon")), value: "true" },
        { label: toUpperCase(t("socials.filters.noIcon")), value: "false" }
      ]
    }
  ];

  const columns: Column<Social>[] = [
    {
      key: "icon",
      label: toUpperCase(t("socials.icon")),
      render: (item) => (
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
      )
    },
    {
      key: "name",
      label: toUpperCase(t("socials.name")),
      sortable: true,
      render: (item) => item.name
    },
    {
      key: "url",
      label: toUpperCase(t("socials.link")),
      sortable: true,
      render: (item) => (
        <a className="text-accent underline!" href={item.url} target="_blank">
          {item.name}
        </a>
      )
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
            {toUpperCase(t("socials.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("socials.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/socials/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("socials.addSocial"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="social"
        filters={filters}
        editUrl="/landing/socials/edit"
        total={data?.count}
        emptyMessage={toUpperCase(t("socials.noSocialsFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div>
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-15 w-1/2" />
                  </div>
                </div>

                <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("socials.created"))}
                    </span>
                    <p className="mt-1 text-sm">
                      <Skeleton className="h-4 w-3/4" />
                    </p>
                  </div>
                </div>
              </div>
            );
          }

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
                  <a
                    className="text-accent underline!"
                    href={item?.url}
                    target="_blank"
                  >
                    {item?.name}
                  </a>
                </div>
              </div>
              <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("socials.created"))}
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

export const SocialsNavigationRoute = {
  element: <Socials />,
  path: "/landing/socials"
};

export default Socials;
