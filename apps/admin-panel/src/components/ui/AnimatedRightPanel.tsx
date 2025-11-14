import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import Logo from "@/assets/medory.webp";
import { cn, platformServices } from "@/libs";

export const AnimatedRightPanel: React.FC<{
  children?: React.ReactNode;
}> = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="from-auth-visual-bg via-auth-visual-secondary to-auth-visual-bg relative flex-1 overflow-hidden bg-linear-to-br">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-indigo-600/30 to-blue-800/20"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(37, 99, 235, 0.2), rgba(79, 70, 229, 0.3), rgba(30, 64, 175, 0.2))",
              "linear-gradient(225deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.3))",
              "linear-gradient(45deg, rgba(37, 99, 235, 0.2), rgba(79, 70, 229, 0.3), rgba(30, 64, 175, 0.2))"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-white/8 backdrop-blur-sm"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-1/3 left-1/5 h-32 w-32 rounded-full bg-white/6 backdrop-blur-sm"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Flowing lines */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 600">
          <motion.path
            d="M0,200 Q200,100 400,200 T800,200"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M0,400 Q200,300 400,400 T800,400"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
        </svg>

        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/20"
            style={{
              left: `${20 + ((i * 7) % 60)}%`,
              top: `${30 + ((i * 11) % 40)}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "60px 60px", "0px 0px"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-16 py-8 text-white xl:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3 xl:mb-6">
            <img src={Logo} alt="Medory" className="h-12 w-12 rounded-lg" />

            <div>
              <h1 className="text-[18px] font-bold lg:text-[22px] xl:text-[24px]">
                {toUpperCase(t("global.name"))}
              </h1>
              <p className="text-sm text-white/80">
                {toUpperCase(t("global.platform"))}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2
              className={cn(
                "mb-4 leading-tight font-bold xl:mb-6",
                i18n.language === "en"
                  ? "text-[24px] xl:text-[32px] 2xl:text-[36px]"
                  : "text-[20px] xl:text-[24px] 2xl:text-[28px]"
              )}
            >
              {toUpperCase(t("global.overview"))}
            </h2>
            <p
              className={cn(
                "mb-2 leading-relaxed text-white/90 xl:mb-8",
                i18n.language === "en"
                  ? "text-[16px] xl:text-[20px]"
                  : "text-[14px] xl:text-[18px]"
              )}
            >
              {toUpperCase(t("global.description"))}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {platformServices?.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-3 xl:gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm xl:h-12 xl:w-12 xl:rounded-xl">
                <feature.icon className="h-4 w-4 xl:h-5 xl:w-5" />
              </div>
              <div>
                <h3 className="mb-1 text-[14px] leading-3.5 font-semibold xl:text-[16px] xl:leading-5">
                  {toUpperCase(t(feature.title))}
                </h3>
                <p className="text-[12px] text-white/70 xl:text-sm xl:text-[13px]">
                  {toUpperCase(t(feature.desc))}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
