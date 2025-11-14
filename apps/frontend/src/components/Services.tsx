"use client";

import { useGetServices } from "@/lib/queries";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { getFullFilePath, getTranslatedObject, toUpperCase } from "@/utils";
import { Card, CardContent } from "./ui";

const Services = () => {
  const t = useTranslations("Services");
  const language = useLocale();
  const { data, isFetching } = useGetServices();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  if (isFetching) {
    return (
      <section className="py-24 lg:py-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-card/70">
            Loading services…
          </div>
        </div>
      </section>
    );
  }

  const services = data?.data ?? [];

  return (
    <section id="services" className="py-24 lg:py-40 relative overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-primary">
            {toUpperCase(t("title") ?? "")}
          </h2>
          <p className="text-xl leading-relaxed text-primary/80">
            {toUpperCase(t("subTitle") ?? "")}
          </p>
        </motion.div>

        {services.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            {t("noServices") ?? "No services available"}
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {services.map((service: any, index: number) => {
              const translation =
                getTranslatedObject(service?.translations, language) ?? {};
              const imageSrc =
                service?.icon?.path && getFullFilePath(service?.icon.path)
                  ? getFullFilePath(service?.icon.path)
                  : "";
              const serviceNumber = String(index + 1).padStart(3, "0");

              return (
                <motion.div key={service?.id ?? index} variants={itemVariants}>
                  <Card className="group h-full hover:shadow-premium hover:border-primary/30 transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden rounded-3xl">
                    <CardContent className="p-8 space-y-4">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {imageSrc ? (
                            <Image
                              width={48}
                              height={48}
                              src={imageSrc}
                              alt={translation?.title ?? "service icon"}
                              className="h-6 w-6"
                              unoptimized
                            />
                          ) : (
                            ""
                          )}
                        </motion.div>

                        <span className="text-5xl font-semibold select-none text-primary/15">
                          {serviceNumber}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-primary">
                        {toUpperCase(translation.title ?? "")}
                      </h3>

                      <p className="leading-relaxed text-sm text-primary/80">
                        {toUpperCase(translation.description ?? "")}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export { Services };
