"use client";

import { useGetIntroduce } from "@/lib/queries";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { getFullFilePath, getTranslatedObject, toUpperCase } from "@/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { IntroduceSkeletion } from "./ui";
import { useState } from "react";
import { Play } from "lucide-react";
import Image from "next/image";

const Introduce = () => {
  const language = useLocale();
  const { data, isFetching } = useGetIntroduce();
  const [showVideo, setShowVideo] = useState(false);

  if (isFetching) return <IntroduceSkeletion />;

  const introduce = data?.data;
  const video = introduce?.video;
  const thumbnail = introduce?.thumbnail;
  const translation = getTranslatedObject(introduce?.translations, language);

  return (
    <section
      id="about"
      className="py-10 md:py-16 lg:py-30 w-full relative max-w-[1440px] wrapper h-full px-4 md:px-6"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/6 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="z-1">
        <motion.div
          className="mx-auto text-center"
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
            className="md:text-xl lg:text-2xl text-primary/80 leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <MarkdownRenderer content={translation?.description} />
          </motion.div>
          {thumbnail && video ? (
            <motion.div
              className="relative mx-auto mt-10 md:mt-14 lg:mt-20 max-w-6xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-primary/20 shadow-2xl">
                <div className="absolute -top-4 -left-4 w-32 h-32 border-4 border-primary/20 rounded-3xl -z-10" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-accent/20 rounded-3xl -z-10" />
                <div className="absolute top-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
                <div className="absolute bottom-8 -right-8 w-24 h-24 bg-primary-glow/5 rounded-full blur-2xl -z-10" />

                <div className="relative aspect-video bg-linear-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                  {!showVideo ? (
                    <>
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5">
                        <Image
                          src={getFullFilePath(thumbnail?.path || "")}
                          alt={thumbnail?.name}
                          width={1440}
                          height={810}
                          className="w-full h-full object-cover "
                        />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                          onClick={() => setShowVideo(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative group"
                          aria-label="Play video"
                        >
                          <div className="absolute inset-0 w-28 h-28 bg-primary/30 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-300" />

                          <div className="relative w-24 h-24 rounded-full bg-primary shadow-2xl flex items-center justify-center group-hover:bg-primary-dark transition-all duration-300">
                            <Play
                              className="w-10 h-10 text-primary-foreground ml-1.5"
                              fill="currentColor"
                            />
                          </div>

                          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/50 animate-ping" />
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                    >
                      <source
                        src={getFullFilePath(video.path)}
                        type="video/mp4"
                      />
                    </video>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            ""
          )}
        </motion.div>
      </div>
    </section>
  );
};

export { Introduce };
