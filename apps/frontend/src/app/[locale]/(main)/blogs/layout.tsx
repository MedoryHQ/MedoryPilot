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
    title: `${t("blogsTitle")} - ${t("title")}`,
    description: t("blogsDescription"),
  };

  return meta;
}

export default function BlogsMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
