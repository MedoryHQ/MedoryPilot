"use client";

import { useGetIntroduce } from "@/lib/queries";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { getTranslatedObject, toUpperCase } from "@/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Skeleton } from "./ui";

const Introduce = () => {
  const language = useLocale();
  const { data, isFetching } = useGetIntroduce();

  if (isFetching) {
    return (
      <section className="py-24 lg:py-40 flex flex-col w-full items-center">
        <Skeleton className="h-[70px] w-full mb-8 max-w-2xl" />
        <div className="flex flex-col gap-1 max-w-4xl w-full">
          <Skeleton className="h-[18px]" />
          <Skeleton className="h-[18px]" />
          <Skeleton className="h-[18px]" />
        </div>
      </section>
    );
  }
  const introduce = data?.data;
  const translation = getTranslatedObject(introduce?.translations, language);

  return (
    <section id="about" className="py-20 md:py-24 lg:py-40 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-foreground/15 rounded-full blur-3xl" />
      </div>

      <div className="z-1">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-8 leading-[1.15] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {toUpperCase(translation?.headline)}
          </motion.h2>
          <motion.div
            className="md:text-xl lg:text-2xl text-primary/80 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <MarkdownRenderer content={translation?.description} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export { Introduce };
