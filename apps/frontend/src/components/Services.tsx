"use client";

import { useGetServices } from "@/lib/queries";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { getFullFilePath, getTranslatedObject, toUpperCase } from "@/utils";
import { Card, CardContent, ServiceSkeletion } from "./ui";

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
  const services = data?.data ?? [];

  return (
    <section
      id="services"
      className="py-20 md:py-24 lg:py-36 relative overflow-hidden bg-transparent w-full mt-10 md:mt-14 "
    >
      <div className="absolute inset-0 z-0 bg-background/95">
        <div
          className="absolute top-[5%] left-[10%] w-[700px] h-[700px] bg-primary/25 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-[30%] right-[5%] w-[800px] h-[800px] bg-primary-glow/30 rounded-full blur-[180px] animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-[10%] left-[35%] w-[600px] h-[600px] bg-accent/25 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div className="absolute top-[50%] left-[0%] w-[500px] h-[500px] bg-accent rounded-full blur-[150px]" />
        <div className="absolute top-[15%] right-[25%] w-[450px] h-[450px] bg-accent rounded-full blur-[160px]" />
        <div className="absolute bottom-[25%] right-[15%] w-[550px] h-[550px] bg-accent rounded-full blur-[170px]" />
        <div className="absolute top-[70%] left-[20%] w-[400px] h-[400px] bg-accent rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] w-[350px] h-[350px] bg-accent rounded-full blur-[130px]" />
        <div className="absolute bottom-[40%] right-[40%] w-[380px] h-[380px] bg-accent rounded-full blur-[145px]" />
        <div className="absolute top-[20%] left-[5%] w-[300px] h-[300px] bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[320px] h-80 bg-accent rounded-full blur-[125px]" />
      </div>
      {isFetching ? (
        <ServiceSkeletion />
      ) : (
        <div className="mx-auto z-1 max-w-[1440px] h-full px-4 md:px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 z-2 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 tracking-tight text-primary">
              {toUpperCase(t("title") ?? "")}
            </h2>
            <p className=" md:text-xl lg:text-2xl leading-relaxed text-primary/80">
              {toUpperCase(t("subTitle") ?? "")}
            </p>
          </motion.div>

          {services.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              {t("noServices") ?? "No services available"}
            </div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8"
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
                  <motion.div
                    key={service?.id ?? index}
                    variants={itemVariants}
                  >
                    <Card className="group h-full hover:shadow-2xl hover:border-primary/30 transition-all duration-500 border-border/30 bg-card/70 backdrop-blur-sm relative overflow-hidden">
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 shadow-sm"
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
                            )}{" "}
                          </motion.div>
                          <span className="text-[120px] font-bold text-primary/5 select-none absolute -top-8 -right-4 leading-none">
                            {serviceNumber}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-primary relative z-10">
                          {toUpperCase(translation.title ?? "")}{" "}
                        </h3>
                        <p className="text-primary/70 leading-relaxed text-sm relative z-10">
                          {toUpperCase(translation.description ?? "")}{" "}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
};

export { Services };
