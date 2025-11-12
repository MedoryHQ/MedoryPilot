"use client";

import { useGetHero } from "@/lib/queries";
import { useLocale, useTranslations } from "next-intl";
import { Stethoscope, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getFullFilePath, getTranslatedObject, toUpperCase } from "@/utils";
import { Link } from "@/i18n/routing";
import { HeroSkeletion } from "./ui";

const Hero = () => {
  const t = useTranslations("Hero");
  const language = useLocale();
  const { data, isFetching } = useGetHero();

  const translation =
    getTranslatedObject(data?.data?.translations, language) ?? {};

  if (isFetching) {
    return <HeroSkeletion />;
  }

  const stats = [
    {
      id: "experience",
      value: data?.data?.experience ? `${data.data.experience}+` : "—",
      label: t("year_experience"),
    },
    {
      id: "visits",
      value: data?.data?.visits ? `${data.data.visits}+` : "—",
      label: t("clients"),
    },
    {
      id: "tariff",
      value:
        typeof data?.tariff?.price !== "undefined"
          ? `${data?.tariff.price}₾`
          : "70₾",
      label: t("each_visit"),
    },
  ];

  const heroImageSrc =
    data?.data?.logo?.path && getFullFilePath(data.data.logo.path)
      ? getFullFilePath(data.data.logo.path)
      : "";
  return (
    <section
      id="home"
      className="relative pt-8 overflow-hidden mb-6 md:mb-8 lg:mb-10"
    >
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <motion.div className="bg-linear-to-br from-accent/70 to-accent rounded-4xl p-8 flex flex-col justify-between lg:p-12 space-y-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                aria-hidden
              >
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {toUpperCase(translation?.position)}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-4 mb-10"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-medium text-primary leading-tight">
                  {toUpperCase(translation?.headline)}
                </h1>
                <p className="text-base lg:text-lg text-primary/80 leading-relaxed">
                  {translation?.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/sign-in"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3.5 flex items-center rounded-2xl font-semibold transition-all duration-300"
                  aria-label={t("bookAppointment")}
                >
                  {toUpperCase(t("bookAppointment"))}
                </Link>

                <Link
                  href="/about-me"
                  className="border-primary border-1.5 hover:bg-secondary/40 bg-transparent text-primary px-6 py-3.5 flex items-center rounded-2xl font-semibold transition-all duration-300"
                  aria-label={t("seeAboutMe")}
                >
                  {t("seeAboutMe")}
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid sm:grid-cols-2 gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative bg-online rounded-3xl p-6 overflow-hidden cursor-pointer shadow-lg group"
                role="button"
                tabIndex={0}
                aria-label={toUpperCase(t("onlineMeeting"))}
              >
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-bold text-onliwhitene-dark/60">
                    {toUpperCase(t("onlineMeeting"))}
                  </h3>
                  <p className="text-sm text-online-dark">
                    {toUpperCase(t("available"))}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-online-dark/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative bg-onsite rounded-3xl p-6 overflow-hidden cursor-pointer shadow-lg group"
                role="button"
                tabIndex={0}
                aria-label={t("onsiteMeeting")}
              >
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-bold text-onsite-dark">
                    {toUpperCase(t("onsiteMeeting"))}
                  </h3>
                  <p className="text-sm text-onsite-dark">
                    {toUpperCase(t("bookNow"))}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-onsite-dark/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative rounded-4xl overflow-hidden"
          >
            <Image
              src={heroImageSrc}
              alt={translation?.headline ?? "Hero image"}
              width={1920}
              height={1920}
              priority
              className="w-full h-full object-cover"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-10 left-10 right-10 grid grid-cols-3 gap-5"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl p-6 shadow-xl flex flex-col"
                >
                  <p className="text-3xl font-bold text-primary">
                    {toUpperCase(stat.value)}
                  </p>
                  <p className="text-md text-muted-foreground mt-1">
                    {toUpperCase(stat.label)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
