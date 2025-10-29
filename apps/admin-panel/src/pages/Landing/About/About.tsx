import { AboutForm } from "@/components/forms";
import { useGetAbout } from "@/libs/queries";
import { Spin } from "antd";

const About = () => {
  const { data, refetch, isFetching, error } = useGetAbout();

  if (isFetching) {
    return (
      <div className="absolute inset-0 flex min-h-screen w-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const entityData = data?.data;
  const hasAbout = !error && !!entityData;

  return (
    <AboutForm
      mode={hasAbout ? "readonly" : "create"}
      id={entityData?.id ?? undefined}
      entityData={entityData}
      refetch={refetch}
    />
  );
};

export const AboutNavigationRoute = {
  element: <About />,
  path: "/landing/about"
};

export default About;
