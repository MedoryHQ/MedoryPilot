import { motion } from "framer-motion";
import { Badge, Button, DataTable } from "@/components/ui";
import { useGetFaqs } from "@/libs/queries";
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
import { Faq } from "@/types/website";

const Faqs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetFaqs(filledSearchParams);

  const columns: Column<Faq>[] = [
    {
      key: "order",
      label: toUpperCase(t("faqs.order")),
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.order}
        </Badge>
      )
    },
    {
      key: "question",
      label: toUpperCase(t("faqs.question")),
      render: (item: Faq) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return (
          <span className="text-foreground line-clamp-3 max-w-[260px] text-sm">
            {toUpperCase(tr.question)}
          </span>
        );
      }
    },
    {
      key: "answer",
      label: toUpperCase(t("faqs.answer")),
      render: (item: Faq) => {
        const tr = getTranslatedObject(item.translations, i18n.language);
        return (
          <span className="text-foreground line-clamp-3 max-w-[400px] text-sm">
            {toUpperCase(tr.answer)}
          </span>
        );
      }
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("faqs.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
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
            {toUpperCase(t("faqs.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("faqs.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="premium-button floating-action flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/faqs/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("faqs.addFaq"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="faq"
        editUrl="/landing/faqs/edit"
        total={data?.count}
        emptyMessage={toUpperCase(t("faqs.noFaqsFound"))}
        mobileCardRender={(item) => {
          const tr = getTranslatedObject(item.translations, i18n.language);
          return (
            <div>
              <div className="border-border mb-4 border-b">
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("faqs.question"))}
                </span>
                <h5 className="mb-2 text-[14px]">{toUpperCase(tr.question)}</h5>
                <span className="text-muted-foreground text-sm">
                  {toUpperCase(t("faqs.answer"))}
                </span>
                <p className="text-foreground mb-3 line-clamp-4 text-[10px]">
                  {toUpperCase(tr.answer)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("faqs.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {item.translations?.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {toUpperCase(t("faqs.created"))}
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

export const FaqsNavigationRoute = {
  element: <Faqs />,
  path: "/landing/faqs"
};

export default Faqs;
