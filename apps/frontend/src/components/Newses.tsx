"use client";

import { useGetNewses } from "@/lib/queries";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { getFullFilePath, getTranslatedObject, toUpperCase } from "@/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  NewsesSkeletion,
} from "./ui";
import { useEffect, useState, useMemo, useCallback } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { formatDate } from "@/utils/date";
import React from "react";
import { routing } from "@/i18n/routing";
import { useRouter } from "next/navigation";

type ThumbnailProps = {
  src: string;
  alt?: string;
  index: number;
  active: boolean;
  onClick: (i: number) => void;
};

const ThumbnailButton = React.memo(function ThumbnailButton({
  src,
  alt,
  index,
  active,
  onClick,
}: ThumbnailProps) {
  return (
    <button
      aria-label={`Go to news ${index + 1}`}
      title={`Go to news ${index + 1}`}
      onClick={() => onClick(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(index);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
        }
      }}
      className={`relative w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 md:border-3 transition-all duration-300 focus:outline-none ${
        active
          ? "border-primary scale-110 shadow-medium"
          : "border-border/50 opacity-70 hover:opacity-100 hover:scale-105"
      }`}
      type="button"
    >
      <Image
        src={src || "/images/placeholder-64.png"}
        alt={alt ?? `thumbnail-${index + 1}`}
        width={64}
        height={64}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {active && (
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/40" />
      )}
    </button>
  );
});

const Newses = () => {
  const language = useLocale();
  const router = useRouter();
  const { data, isFetching } = useGetNewses("showInLanding=true");
  const [api, setApi] = useState<CarouselApi | undefined>();
  const t = useTranslations("Newses");
  const [current, setCurrent] = useState(0);

  const newses = useMemo(() => data?.data ?? [], [data]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const thumbnails = useMemo(
    () =>
      newses.map((n) =>
        getFullFilePath(n.background?.path || n.metaImage?.path || "")
      ),
    [newses]
  );

  const pointerRef = React.useRef<{ x: number; y: number; moved: boolean }>({
    x: 0,
    y: 0,
    moved: false,
  });
  const MOVE_THRESHOLD = 8; // px

  const buildNewsUrl = (slugOrId?: string | null) => {
    const base = routing.pathnames["/newses"] || "/newses";
    const slug = slugOrId ? encodeURIComponent(slugOrId) : "";
    return `/${language}${base}${slug ? `/${slug}` : ""}`;
  };

  const getApiSelectedIndex = useCallback(() => {
    if (!api) return 0;
    const anyApi = api as any;
    try {
      if (typeof anyApi.selectedScrollSnap === "function") {
        return anyApi.selectedScrollSnap();
      }
      if (typeof anyApi.selected === "function") {
        return anyApi.selected();
      }
      if (typeof anyApi.selectedIndex === "number") {
        return anyApi.selectedIndex;
      }
      if (typeof anyApi.index === "function") {
        return anyApi.index();
      }
      if (typeof anyApi.getSelectedIndex === "function") {
        return anyApi.getSelectedIndex();
      }
    } catch {
      // ignore
    }
    return 0;
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const anyApi = api as any;
    let cleanup: (() => void) | undefined;

    const updateSelected = () => {
      const idx = getApiSelectedIndex();
      setCurrent(idx);
    };

    if (typeof anyApi.on === "function") {
      anyApi.on("select", updateSelected);
      anyApi.on("reInit", updateSelected);
      anyApi.on?.("scroll", updateSelected);
      cleanup = () => {
        anyApi.off?.("select", updateSelected);
        anyApi.off?.("reInit", updateSelected);
        anyApi.off?.("scroll", updateSelected);
      };
    } else {
      const id = window.setInterval(updateSelected, 250);
      cleanup = () => clearInterval(id);
    }

    updateSelected();

    return () => {
      cleanup && cleanup();
    };
  }, [api, getApiSelectedIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (!api) {
        setCurrent(index);
        return;
      }
      try {
        const anyApi = api as any;
        if (typeof anyApi.scrollTo === "function") {
          anyApi.scrollTo(index);
        } else if (typeof anyApi.scrollToIndex === "function") {
          anyApi.scrollToIndex(index);
        } else if (typeof anyApi.scrollToSlide === "function") {
          anyApi.scrollToSlide(index);
        } else if (typeof anyApi.moveTo === "function") {
          anyApi.moveTo(index);
        } else {
          setCurrent(index);
        }
      } catch {
        setCurrent(index);
      }
    },
    [api]
  );

  return (
    <section className="py-20 md:py-24 lg:py-40 w-full bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="mx-auto text-center px-4 md:px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h2
          className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2 md:mb-4 xl:mb-8 leading-[1.15] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true, amount: 0.2 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {toUpperCase(t("title"))}
        </motion.h2>
        <motion.p
          className="md:text-xl lg:text-2xl text-primary/80 leading-relaxed max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {toUpperCase(t("subTitle"))}
        </motion.p>

        {isFetching ? (
          <NewsesSkeletion />
        ) : (
          <div>
            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              className="w-full max-w-[1440px] mx-auto rounded-3xl overflow-hidden"
            >
              <CarouselContent>
                {newses.map((news, index) => {
                  const background = news?.background;
                  const translation = getTranslatedObject(
                    news?.translations,
                    language
                  );

                  const onPointerDown = (e: React.PointerEvent) => {
                    pointerRef.current.x = e.clientX;
                    pointerRef.current.y = e.clientY;
                    pointerRef.current.moved = false;
                  };

                  const onPointerMove = (e: React.PointerEvent) => {
                    const dx = Math.abs(e.clientX - pointerRef.current.x);
                    const dy = Math.abs(e.clientY - pointerRef.current.y);
                    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
                      pointerRef.current.moved = true;
                    }
                  };

                  const onPointerUp = () => {
                    if (!pointerRef.current.moved) {
                      const target = news?.slug ?? news?.id;
                      const url = buildNewsUrl(target);
                      router.push(url);
                    }
                  };

                  const handleKeyDownNavigate = (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const target = news?.slug ?? news?.id;
                      const url = buildNewsUrl(target);
                      router.push(url);
                    }
                  };

                  return (
                    <CarouselItem key={news.id ?? index} className="pl-4">
                      <motion.div
                        className="relative w-full h-[210px] md:h-[450px] lg:h-[550px] rounded-md md:rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true, amount: 0.2 }}
                        role="link"
                        tabIndex={0}
                        onClick={() => console.log("sf")}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onKeyDown={handleKeyDownNavigate}
                        aria-label={translation?.name ?? `news-${index + 1}`}
                      >
                        <Image
                          src={getFullFilePath(background?.path || "")}
                          alt={background?.name || "news background"}
                          width={1440}
                          height={810}
                          className="w-full min-w-full h-auto min-h-full  object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-linear-to-t group-hover:opacity-95 opacity-70 from-background via-background to-background/0 transition-all duration-500" />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 p-4 md:p-10 lg:p-14 text-start"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.6 }}
                        >
                          <h6 className="text-primary font-semibold mb-2 md:mb-3 text-[12px] md:text-sm tracking-wider uppercase">
                            {toUpperCase(formatDate(news.createdAt, language))}
                          </h6>
                          <h3 className="md:text-2xl lg:text-4xl font-bold text-foreground mb-3 md:mb-5 leading-tight">
                            {toUpperCase(translation?.name)}
                          </h3>
                          <p className="text-[12px] md:text-lg text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                            {toUpperCase(translation?.description ?? "")}
                          </p>
                        </motion.div>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            <motion.div
              className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {thumbnails.map((src, index) => (
                <ThumbnailButton
                  key={newses[index]?.id ?? index}
                  src={src}
                  alt={
                    newses[index]?.translations?.[0]?.name ??
                    `news-${index + 1}`
                  }
                  index={index}
                  active={current === index}
                  onClick={goTo}
                />
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export { Newses };
