"use client";

import { useGetFaqs } from "@/lib/queries";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn, getTranslatedObject, toUpperCase } from "@/utils";
import // FAQsSkeletion,
"./ui";
import { useMemo } from "react";
import React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui";
import { MarkdownRenderer } from "./MarkdownRenderer";

const FAQs = () => {
  const language = useLocale();
  const { data, isFetching } = useGetFaqs();
  const t = useTranslations("FAQs");

  const Faqs = useMemo(() => data?.data ?? [], [data]);

  return (
    <section className="py-12 md:py-16 lg:py-20 w-full bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 xl:gap-24 items-center">
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-premium">
              <div className="w-full bg-cover h-[600px]">
                <Image
                  src="/images/faq_background.jpeg"
                  width={1000}
                  height={1000}
                  alt="Faqs background"
                  className="object-cover h-full w-auto"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="mb-12">
              <motion.h2
                className={cn(
                  "font-bold text-primary text-center lg:text-start mb-4 xl:mb-6 tracking-tight",
                  language === "en"
                    ? "text-4xl lg:text-3xl xl:text-5xl"
                    : "text-3xl lg:text-3xl xl:text-4xl"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {toUpperCase(t("title"))}
              </motion.h2>
              <motion.p
                className={cn(
                  "text-muted-foreground text-center lg:text-start",
                  language === "en"
                    ? "text-[18px] lg:text-xl"
                    : "text-[16px] lg:text-[18px]"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {toUpperCase(t("subTitle"))}
              </motion.p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {Faqs.map((item, index) => {
                const translation = getTranslatedObject(
                  item.translations,
                  language
                );
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors"
                    >
                      <AccordionTrigger className="text-left text-lg font-bold text-primary hover:text-primary transition-colors py-6 hover:no-underline">
                        {translation.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 pt-2">
                        <MarkdownRenderer
                          classNames={{ p: "text-left!" }}
                          content={translation.answer}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { FAQs };
