import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { Locale, routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { cn } from "@/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { Viewport } from "next";
import ReactQueryProvider from "@/components/QueryProvider";
import HeroProvider from "@/contexts/HeroProvider";

export const viewport: Viewport = {
  width: "device-width",
  userScalable: false,
  maximumScale: 1,
  initialScale: 1,
};

const notoSans = Noto_Sans_Georgian({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["georgian"],
});

export const generateMetadata = async ({
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "LocaleLayout" });

  return {
    title: t("title"),
  };
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(notoSans.className)}>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <HeroProvider>
              <NuqsAdapter>
                <div className="min-h-mobile md:min-h-desktop">{children}</div>
              </NuqsAdapter>
            </HeroProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
