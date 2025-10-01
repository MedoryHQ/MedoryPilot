import axios from "@/api/axios";
import { useToast } from "@/hooks";
import { useGetHeaders } from "@/libs/queries";
import {
  getPaginationFields,
  getTranslatedObject,
  setHookFormErrors,
  toUpperCase,
  updateQueryParams
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui";
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const Headers = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { filledSearchParams, search } = getPaginationFields(searchParams);

  const { data, isFetching, refetch } = useGetHeaders(filledSearchParams);
  const { mutateAsync: deleteHeader } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`header/${id}`);
    },
    onSuccess: () => {
      refetch();
      toast.success(
        toUpperCase(t("toast.success")),
        toUpperCase(t("toast.deleteHeader"))
      );
    },
    onError: (error: any) => {
      setHookFormErrors(
        error,
        toast,
        t,
        i18n.language as "ka" | "en",
        () => {}
      );
    }
  });

  const enTranslation = getTranslatedObject(data?.data || [], "en");

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-semibold">
            {toUpperCase(t("headers.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("headers.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/website/headers/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("headers.addHeader"))}
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
            <Input
              placeholder={toUpperCase(t("headers.search"))}
              value={search}
              onChange={(e) => {
                updateQueryParams({}, "", e.target.value, navigate);
              }}
              className="h-12 pl-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-border border-b-2">
                <tr>
                  <th className="text-foreground px-6 py-5 text-left font-semibold">
                    {toUpperCase(t("headers.name"))}
                  </th>
                  <th className="text-foreground px-6 py-5 text-left font-semibold">
                    {toUpperCase(t("headers.position"))}
                  </th>
                  <th className="text-foreground px-6 py-5 text-center font-semibold">
                    {toUpperCase(t("headers.translations"))}
                  </th>
                  <th className="text-foreground px-6 py-5 text-center font-semibold">
                    {toUpperCase(t("headers.status"))}
                  </th>
                  <th className="text-foreground px-6 py-5 text-center font-semibold">
                    {toUpperCase(t("headers.actions"))}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-muted-foreground py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
                        <p className="text-lg">
                          {toUpperCase(t("headers.noHeadersFound"))}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.data.map((header, index) => (
                    <motion.tr
                      key={header.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`border-border/50 hover:bg-muted/20 border-b transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"} `}
                    >
                      <td className="px-6 py-5">
                        <div className="text-foreground font-medium">
                          {enTranslation?.name || ""}
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          {toUpperCase(t("headers.created"))}:{" "}
                          {header.createdAt}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-foreground">
                          {enTranslation?.position || ""}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant="secondary" className="px-3 py-1">
                          {header.translations.length}{" "}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge
                          variant={header.active ? "default" : "outline"}
                          className="px-3 py-1"
                        >
                          {header.active
                            ? toUpperCase(t("headers.active"))
                            : toUpperCase(t("headers.inactive"))}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/website/headers/edit?id=${header.id}`)
                            }
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {toUpperCase(t("headers.edit"))}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(header.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {toUpperCase(t("headers.delete"))}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toUpperCase(t("headers.areYouSure"))}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toUpperCase(t("headers.deleteDescription"))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {toUpperCase(t("headers.cancel"))}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteHeader(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {toUpperCase(t("headers.delete"))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export const HeadersNavigationRoute = {
  element: <Headers />,
  path: "/landing/headers"
};

export default Headers;
