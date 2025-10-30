import { motion } from "framer-motion";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useGetVideos } from "@/libs/queries";
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
import { Video } from "@/types/website";
import { Column, FilterConfig } from "@/types/ui";

const Videos = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filledSearchParams } = getPaginationFields(searchParams);
  const { data, refetch, isFetching } = useGetVideos(filledSearchParams);

  const filters: FilterConfig[] = [
    {
      key: "thumbnail",
      label: toUpperCase(t("videos.filters.hasThumbnail")),
      type: "select",
      options: [
        { label: toUpperCase(t("videos.filters.hasThumbnail")), value: "true" },
        { label: toUpperCase(t("videos.filters.noThumbnail")), value: "false" }
      ]
    }
  ];

  const columns: Column<Video>[] = [
    {
      key: "video",
      label: toUpperCase(t("videos.video")),
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/10 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
              {item.thumbnail ? (
                <img
                  src={getFileUrl(item.thumbnail.path)}
                  alt={item.thumbnail.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-muted-foreground h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {toUpperCase(translation.name)}
              </div>
            </div>
          </div>
        );
      },

      mobileLabel: toUpperCase(t("videos.name"))
    },
    {
      key: "translationsCount",
      label: toUpperCase(t("videos.translations")),
      render: (item) => (
        <Badge variant="secondary" className="px-3 py-1">
          {item.translations?.length}
        </Badge>
      ),
      className: "text-center"
    },
    {
      key: "link",
      label: toUpperCase(t("videos.link")),
      sortable: true,
      render: (item) => {
        const translation = getTranslatedObject(
          item.translations,
          i18n.language
        );
        return (
          <a
            className="text-accent !underline"
            href={item.link}
            target="_blank"
          >
            {toUpperCase(translation?.name)}
          </a>
        );
      }
    },
    {
      key: "date",
      label: toUpperCase(t("videos.from") || "From"),
      render: (item) =>
        item.date ? (
          <div className="text-sm">{formatDate(item.date, i18n.language)}</div>
        ) : (
          ""
        ),
      className: "text-left",
      sortable: true
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
            {toUpperCase(t("videos.management"))}
          </h1>
          <p className="text-muted-foreground">
            {toUpperCase(t("videos.managementDescription"))}
          </p>
        </div>
        <Button
          size="lg"
          className="flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          onClick={() => navigate("/landing/videos/create")}
        >
          <Plus className="h-5 w-5" />
          {toUpperCase(t("videos.addVideo"))}
        </Button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        refetch={refetch}
        isLoading={isFetching}
        deleteEndpoint="video"
        filters={filters}
        total={data?.count}
        editUrl="/landing/videos/edit"
        emptyMessage={toUpperCase(t("videos.noVideosFound"))}
        mobileCardRender={(item) => {
          if (isFetching || !item) {
            return (
              <div className="px-3 py-4">
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted/10 mb-0 flex h-16 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>

                <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("videos.translations"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("videos.date"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">
                      {toUpperCase(t("videos.link"))}
                    </span>
                    <div className="mt-1">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const translation = getTranslatedObject(
            item.translations,
            i18n.language
          );

          return (
            <div className="px-3 py-4">
              <div className="flex items-start gap-3">
                <div className="border-border bg-muted/10 flex h-16 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  {item.thumbnail ? (
                    <img
                      src={getFileUrl(item.thumbnail.path)}
                      alt={item.thumbnail.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-foreground truncate font-medium">
                      {toUpperCase(translation?.name || "")}
                    </h3>

                    <div className="text-right">
                      <span className="text-muted-foreground block text-xs">
                        {toUpperCase(t("videos.date"))}
                      </span>
                      <div className="mt-1 text-sm">
                        {item.date ? formatDate(item.date, i18n.language) : "-"}
                      </div>
                    </div>
                  </div>

                  {translation?.description ? (
                    <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                      {toUpperCase(translation.description)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("videos.translations"))}
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary" className="px-3 py-1">
                      {item.translations?.length ?? 0}
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("videos.created"))}
                  </span>
                  <p className="mt-1 text-sm">
                    {formatDate(item.createdAt, i18n.language, true)}
                  </p>
                </div>

                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">
                    {toUpperCase(t("videos.link"))}
                  </span>
                  <p className="mt-1 truncate text-sm">
                    {item.link ? (
                      <a
                        className="text-accent break-words !underline"
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.link}
                      </a>
                    ) : (
                      "-"
                    )}
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

export const VideosNavigationRoute = {
  element: <Videos />,
  path: "/landing/videos"
};

export default Videos;
