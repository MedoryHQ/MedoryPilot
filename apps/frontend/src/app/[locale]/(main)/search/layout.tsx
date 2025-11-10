import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetaDataProps): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "LocaleLayout" });
  const meta: Metadata = {
    title: `${t("searchTitle")} - ${t("title")}`,
    description: t("searchDescription"),
  };

  return meta;
}

export default function SearchMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
