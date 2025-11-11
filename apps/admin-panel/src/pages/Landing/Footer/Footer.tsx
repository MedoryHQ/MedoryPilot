import { LoadingScreen } from "@/components";
import { FooterForm } from "@/components/forms";
import { useGetFooter } from "@/libs/queries";

const Footer = () => {
  const { data, refetch, isFetching, error } = useGetFooter();

  if (isFetching) {
    return <LoadingScreen />;
  }

  const entityData = data?.data;
  const hasFooter = !error && !!entityData;

  return (
    <FooterForm
      mode={hasFooter ? "readonly" : "create"}
      id={entityData?.id ?? undefined}
      entityData={entityData}
      refetch={refetch}
    />
  );
};

export const FooterNavigationRoute = {
  element: <Footer />,
  path: "/landing/footer"
};

export default Footer;
