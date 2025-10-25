import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  /* any other config options you have */
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
      },
      {
        protocol: (process.env.NEXT_PUBLIC_PROTOCOL as "https") || "http",
        hostname: process.env.NEXT_PUBLIC_HOSTNAME || "localhost",
        pathname: "/uploads/**/*",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
