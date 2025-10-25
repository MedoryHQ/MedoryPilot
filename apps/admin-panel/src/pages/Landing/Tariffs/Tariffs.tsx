import { motion } from "framer-motion";
import { Badge, Button, DataTable, Skeleton } from "@/components/ui";
import { formatDate, getPaginationFields, toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Column, FilterConfig } from "@/types/ui";
import { useGetTariffs } from "@/libs/queries/tariff";
import { Tariff } from "@/types/website";

const Tariffs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { filledSearchParams } = getPaginationFields(searchParams);

  const { data, refetch, isFetching } = useGetTariffs(filledSearchParams);

  const items = data?.data ?? [];
  const total = data?.count;

  const filters: FilterConfig[] = [
    {
      key: "price",
      label: toUpperCase(t("tariffs.filters.price") || "Price"),
      type: "number"
    },
    {
      key: "type",
      label: toUpperCase(t("tariffs.filters.type") || "Type"),
      type: "select",
      options: [
        {
          label: toUpperCase(t("tariffs.tariff") || "Tariff"),
          value: "tariff"
        },
        {
          label: toUpperCase(t("tariffs.history") || "History"),
          value: "history"
        }
      ]
    }
  ];

  const columns: Column<Tariff>[] = [
    {
      key: "type",
      label: toUpperCase(t("tariffs.type") || "Type"),
      render: (item) => (
        <Badge
          variant={item.isCurrent ? "default" : "secondary"}
          className="px-3 py-1"
        >
          {toUpperCase(
            t(item.isCurrent ? "tariffs.tariff" : "tariffs.history")
          )}
        </Badge>
      ),
      className: "w-[110px] text-center"
    },
    {
      key: "price",
      label: toUpperCase(t("tariffs.price") || "Price"),
      sortable: true,
      render: (item) => <div className="font-medium">{String(item.price)}</div>,
      className: "text-left"
    },
    {
      key: "fromDate",
      label: toUpperCase(t("tariffs.from") || "From"),
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
      label: toUpperCase(t("tariffs.to") || "To"),
      render: (item) =>
        item.endDate ? (
          <div className="text-sm">
            {formatDate(item.endDate, i18n.language)}
          </div>
        ) : (
          ""
        ),
      className: "text-left",
      sortable: true
    },
    {
      key: "createdAt",
      label: toUpperCase(t("tariffs.created") || "Created"),
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          {formatDate(item.createdAt, i18n.language, true)}
        </div>
      ),
      className: "text-right w-[160px]"
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
            {toUpperCase(t("tariffs.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("tariffs.managementDescription"))}
          </p>
        </div>

        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/tariffs/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("tariffs.addTariff"))}
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="tariff"
        total={total}
        editUrl="/landing/tariffs/edit"
        emptyMessage={toUpperCase(t("tariffs.noTariffsFound"))}
        searchable
        filters={filters}
        sortable
        keyExtractor={(it) => it.id}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      <Skeleton className="mb-1 h-4 w-20" />
                    </div>
                    <div className="text-foreground mt-1 text-lg font-semibold">
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("tariffs.from"))}
                    </span>
                    <p className="mt-1 text-sm">
                      <Skeleton className="h-4 w-3/4" />
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("tariffs.to"))}
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
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {toUpperCase(
                      t(item?.isCurrent ? "tariffs.tariff" : "tariffs.history")
                    )}
                  </div>
                  <div className="text-foreground mt-1 text-lg font-semibold">
                    {String(item?.price)}
                  </div>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatDate(item?.createdAt, i18n.language, true)}
                </div>
              </div>

              <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("tariffs.from"))}
                  </span>
                  <p className="mt-1 text-sm">
                    {item?.fromDate
                      ? formatDate(item?.fromDate, i18n.language)
                      : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("tariffs.to"))}
                  </span>
                  <p className="mt-1 text-sm">
                    {item?.endDate
                      ? formatDate(item?.endDate, i18n.language)
                      : ""}
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

export const TariffsNavigationRoute = {
  element: <Tariffs />,
  path: "/landing/tariffs"
};

export default Tariffs;
