import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LocaleLayout" });
  return {
    title: `${t("signUp")} - ${t("title")}`,
  };
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
