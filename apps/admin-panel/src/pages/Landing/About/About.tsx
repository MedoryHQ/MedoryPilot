import { LoadingScreen } from "@/components";
import { AboutForm } from "@/components/forms";
import { useGetAbout } from "@/libs/queries";

const About = () => {
  const { data, refetch, isFetching, error } = useGetAbout();

  if (isFetching) {
    return <LoadingScreen />;
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
