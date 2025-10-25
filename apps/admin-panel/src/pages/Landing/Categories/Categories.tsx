import { motion } from "framer-motion";
import { Badge, Button, DataTable, Skeleton } from "@/components/ui";
import { useGetCategories } from "@/libs/queries";
import {
  formatDate,
  getPaginationFields,
  getTranslatedObject,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Column } from "@/types/ui";
import { Category } from "@/types/website";

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetCategories(filledSearchParams);
  const columns: Column<Category>[] = [
    {
      key: "name",
      label: toUpperCase(t("categories.name")),
      render: (item: Category) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return (
          <span className="text-foreground line-clamp-3 max-w-[260px] text-sm">
            {toUpperCase(tr.name)}
          </span>
        );
      }
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("categories.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "blogsCount",
      label: toUpperCase(t("categories.blogs")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item._count.blogs}
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
            {toUpperCase(t("categories.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("categories.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/categories/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("categories.addCategory"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="category"
        editUrl="/landing/categories/edit"
        total={data?.count}
        emptyMessage={toUpperCase(t("categories.noCategoriesFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div>
                <div className="border-border mb-4 border-b">
                  <Skeleton className="mb-2 h-8 w-full" />
                </div>

                <div className="mb-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("categories.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("categories.blogs"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">
                      {toUpperCase(t("categories.created"))}
                    </span>
                    <p className="mt-1 text-sm">
                      <Skeleton className="h-4 w-32" />
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          const tr = getTranslatedObject(item?.translations, i18n.language);
          return (
            <div>
              <div className="border-border mb-4 border-b">
                <h5 className="mb-2 text-[14px]">{toUpperCase(tr?.name)}</h5>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("categories.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item?.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("categories.blogs"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">{item?._count.blogs}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("categories.created"))}
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

export const CategoriesNavigationRoute = {
  element: <Categories />,
  path: "/landing/categories"
};

export default Categories;
