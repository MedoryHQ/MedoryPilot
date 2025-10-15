import { FooterForm } from "@/components/forms";
import { useGetFooter } from "@/libs/queries";
import { Spin } from "antd";

const Footer = () => {
  const { data, refetch, isFetching, error } = useGetFooter();

  if (isFetching) {
    return (
      <div className="absolute inset-0 flex min-h-screen w-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
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
