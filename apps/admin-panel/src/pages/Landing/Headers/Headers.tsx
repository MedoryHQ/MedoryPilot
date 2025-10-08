import { motion } from "framer-motion";
import { Badge, Button } from "@/components/ui";
import { useGetHeaders } from "@/libs/queries";
import {
  getFileUrl,
  getPaginationFields,
  getTranslatedObject,
  toUpperCase,
  updateQueryParamsAndNavigate
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable, Column, FilterConfig } from "@/components/ui";

const Headers = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { pageSize, orderBy, order, search, filledSearchParams } =
    getPaginationFields(searchParams);

  const { data, refetch, isFetching } = useGetHeaders(filledSearchParams);
  const items = data?.data ?? [];

  const getFiltersObjectFromUrl = () => {
    try {
      const raw = searchParams.get("filters") || "{}";
      const decoded = decodeURIComponent(raw);
      return JSON.parse(decoded) as Record<string, any>;
    } catch {
      return {};
    }
  };

  const setFiltersInUrl = (nextFiltersObj: Record<string, any> | null) => {
    const finalFilters = nextFiltersObj ?? {};
    updateQueryParamsAndNavigate(navigate, {
      page: 1,
      pageSize,
      search,
      orderBy,
      order,
      filters: finalFilters
    });
  };

  const handleSort = (sortKey: string, direction: "asc" | "desc" | null) => {
    updateQueryParamsAndNavigate(navigate, {
      page: 1,
      pageSize,
      search,
      orderBy: direction ? sortKey : undefined,
      order: direction ?? undefined,
      filters: getFiltersObjectFromUrl()
    });
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFiltersInUrl(newFilters);
  };

  const handleSearch = (q: string) => {
    updateQueryParamsAndNavigate(navigate, {
      page: 1,
      pageSize,
      search: q ?? "",
      orderBy,
      order,
      filters: getFiltersObjectFromUrl()
    });
  };

  const handlePageChange = (nextPage: number, nextPageSize?: number) => {
    updateQueryParamsAndNavigate(navigate, {
      page: nextPage,
      pageSize: nextPageSize ?? pageSize,
      search,
      orderBy,
      order,
      filters: getFiltersObjectFromUrl()
    });
  };

  const filters: FilterConfig[] = [
    {
      key: "active",
      label: toUpperCase(t("headers.filters.status")),
      type: "select",
      options: [
        { label: toUpperCase(t("headers.active")), value: "true" },
        { label: toUpperCase(t("headers.inactive")), value: "false" }
      ]
    },
    {
      key: "logo",
      label: toUpperCase(t("headers.filters.hasImage")),
      type: "select",
      options: [
        { label: toUpperCase(t("headers.filters.hasImage")), value: "true" },
        { label: toUpperCase(t("headers.filters.noImage")), value: "false" }
      ]
    }
  ];
  const columns: Column<any>[] = [
    {
      key: "header",
      label: toUpperCase(t("headers.header")),
      render: (item) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
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
      mobileLabel: toUpperCase(t("headers.name"))
    },
    {
      key: "position",
      label: toUpperCase(t("headers.position")),
      render: (item) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return <span className="text-foreground">{tr.position}</span>;
      }
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("headers.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "active",
      label: toUpperCase(t("headers.status")),
      sortable: true,
      render: (item) => (
        <Badge
          variant={item.active ? "default" : "outline"}
          className="px-3 py-1"
        >
          {item.active
            ? toUpperCase(t("headers.active"))
            : toUpperCase(t("headers.inactive"))}
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
            {toUpperCase(t("headers.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("headers.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/headers/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("headers.addHeader"))}
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="header"
        searchable
        searchPlaceholder={toUpperCase(t("headers.search"))}
        filters={filters}
        sortable
        pagination={{
          enabled: true,
          pageSize: pageSize || 10,
          pageSizeOptions: [10, 25, 50]
        }}
        keyExtractor={(it) => it.id}
        emptyMessage={toUpperCase(t("headers.noHeadersFound"))}
        mobileCardRender={(item, tableActions) => {
          const tr = getTranslatedObject(item.translations, i18n.language);
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
                  {item.logo ? (
                    <img
                      src={getFileUrl(item.logo.path)}
                      alt={tr.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-semibold">{tr.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {tr.headline}
                  </p>
                </div>
              </div>
              <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("headers.position"))}
                  </span>
                  <p className="mt-1 font-medium">{tr.position}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("headers.status"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant={item.active ? "default" : "outline"}>
                      {item.active
                        ? toUpperCase(t("headers.active"))
                        : toUpperCase(t("headers.inactive"))}
                    </Badge>
                  </div>
                </div>
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
                    {toUpperCase(t("headers.created"))}
                  </span>
                  <p className="mt-1 text-sm">{item.createdAt}</p>
                </div>
              </div>

              {tableActions && tableActions.length > 0 && (
                <div className="border-border flex gap-2 border-t pt-3">
                  {tableActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant || "outline"}
                      size="sm"
                      onClick={() => action.onClick(item)}
                      className="flex-1"
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        }}
        onSort={(sortObj) => {
          handleSort(sortObj.key, sortObj.direction);
        }}
        onFilter={(filtersObj) => {
          handleFilter(filtersObj);
        }}
        onSearch={(q) => handleSearch(q)}
        onPageChange={(pageNumber, newPageSize) =>
          handlePageChange(pageNumber, newPageSize)
        }
      />
    </motion.div>
  );
};

export const HeadersNavigationRoute = {
  element: <Headers />,
  path: "/landing/headers"
};

export default Headers;
