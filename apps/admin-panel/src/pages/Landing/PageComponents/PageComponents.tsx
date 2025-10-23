import { motion } from "framer-motion";
import { Badge, Button, DataTable } from "@/components/ui";
import { useGetPageComponents } from "@/libs/queries";
import { formatDate, getPaginationFields, toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Column, FilterConfig } from "@/types/ui";
import { PageComponent } from "@/types/website";

const PageComponents = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } =
    useGetPageComponents(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "footer",
      label: toUpperCase(t("pageComponents.filters.showInFooter")),
      type: "select",
      options: [
        { label: toUpperCase(t("pageComponents.yes")), value: "true" },
        { label: toUpperCase(t("pageComponents.no")), value: "false" }
      ]
    },
    {
      key: "withMeta",
      label: toUpperCase(t("pageComponents.filters.withMeta")),
      type: "select",
      options: [
        {
          label: toUpperCase(t("pageComponents.filters.withMeta")),
          value: "true"
        },
        {
          label: toUpperCase(t("pageComponents.filters.withoutMeta")),
          value: "false"
        }
      ]
    }
  ];

  const columns: Column<PageComponent>[] = [
    {
      key: "slug",
      label: toUpperCase(t("pageComponents.slug")),
      render: (item) => <span className="text-foreground">{item.slug}</span>,
      sortable: true
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("pageComponents.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "showInFooter",
      label: toUpperCase(t("pageComponents.showInFooter")),
      render: (item) => (
        <Badge
          variant={item.footer ? "default" : "outline"}
          className="px-3 py-1"
        >
          {item.footer
            ? toUpperCase(t("pageComponents.yes"))
            : toUpperCase(t("pageComponents.no"))}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "footerOrder",
      label: toUpperCase(t("pageComponents.footerOrder")),
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="px-3 py-1">
          {item.footerOrder}
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
            {toUpperCase(t("pageComponents.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("pageComponents.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/page-components/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("pageComponents.addPageComponent"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="pageComponent"
        filters={filters}
        total={data?.count}
        editUrl="/landing/page-components/edit"
        emptyMessage={toUpperCase(t("pageComponents.noPageComponentsFound"))}
        mobileCardRender={(item) => {
          return (
            <article className="flex flex-col gap-3">
              <div className="bg-muted/10 relative w-full overflow-hidden rounded-md">
                <div className="mb-2 min-w-0 flex-1">
                  <h3 className="text-foreground font-normal">{item.slug}</h3>
                </div>
                {item.footer && (
                  <span className="absolute top-2 left-2 rounded-md bg-yellow-500/95 px-2 py-0.5 text-xs font-medium text-white">
                    {toUpperCase(
                      t("pageComponents.showInFooter") || "In Footer"
                    )}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("headers.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("headers.footerOrder"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">{item.footerOrder}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("headers.created"))}
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

export const PageComponentsNavigationRoute = {
  element: <PageComponents />,
  path: "/landing/page-components"
};

export default PageComponents;
