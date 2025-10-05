import { useGetHeaders } from "@/libs/queries";
import {
  getFileUrl,
  getPaginationFields,
  getTranslatedObject,
  toUpperCase
} from "@/utils";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge, Button, DataTable } from "@/components/ui";
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import { Action, Column } from "@/types/ui";
import { Header } from "@/types/website";
import { DeleteDialog } from "@/components/forms";

const Headers = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useGetHeaders(filledSearchParams);

  const columns: Column<Header>[] = [
    {
      key: "name",
      label: toUpperCase(t("headers.header")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
              {item.logo ? (
                <img
                  src={getFileUrl(item.logo.path)}
                  alt={translation.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-muted-foreground h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {translation.name}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {translation.headline}
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
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return <span className="text-foreground">{translation.position}</span>;
      }
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("headers.translations")),
      className: "text-center",
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      )
    },
    {
      key: "active",
      label: toUpperCase(t("headers.status")),
      className: "text-center",
      render: (item) => (
        <Badge
          variant={item.active ? "default" : "outline"}
          className="px-3 py-1"
        >
          {item.active
            ? toUpperCase(t("headers.active"))
            : toUpperCase(t("headers.inactive"))}
        </Badge>
      )
    }
  ];

  const actions: Action<Header>[] = [
    {
      label: toUpperCase(t("headers.edit")),
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => navigate(`landing/headers/edit?id=${item.id}`),
      variant: "outline"
    },
    {
      label: toUpperCase(t("headers.delete")),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => setDeleteId(item.id),
      variant: "outline",
      className: "hover:bg-destructive hover:text-destructive-foreground"
    }
  ];

  const mobileCardRender = (item: Header, tableActions?: Action<Header>[]) => {
    const translation = getTranslatedObject(item.translations, i18n.language);
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="border-border bg-muted/10 flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
            {item.logo ? (
              <img
                src={getFileUrl(item.logo.path)}
                alt={translation.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="text-muted-foreground h-8 w-8" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground font-semibold">
              {translation.name}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {translation.headline}
            </p>
          </div>
        </div>

        <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
          <div>
            <span className="text-muted-foreground text-sm">
              {toUpperCase(t("headers.position"))}
            </span>
            <p className="mt-1 font-medium">{translation.position}</p>
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
              <Badge variant="secondary">{item.translations?.length}</Badge>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">
              {toUpperCase(t("headers.created"))}
            </span>
            <p className="mt-1 text-sm">
              {" "}
              {dayjs(item.createdAt).format("MMMM D, YYYY")}
            </p>
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
                className={`flex-1 ${action.className || ""}`}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      className="mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
        data={data?.data || []}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder={toUpperCase(t("headers.search"))}
        emptyMessage={toUpperCase(t("headers.noHeadersFound"))}
        keyExtractor={(item) => item.id}
        mobileCardRender={mobileCardRender}
        pagination={{
          enabled: false
        }}
      />
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        endpoint="header"
        itemId={deleteId}
        onSuccess={() => refetch()}
      />
    </motion.div>
  );
};

export const HeadersNavigationRoute = {
  element: <Headers />,
  path: "/landing/headers"
};

export default Headers;
