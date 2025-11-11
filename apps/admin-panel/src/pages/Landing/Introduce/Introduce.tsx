import { useGetIntroduce } from "@/libs/queries";
import IntroduceForm from "@/components/forms/pageForms/IntroduceForm";
import { LoadingScreen } from "@/components";

const Introduce = () => {
  const { data, refetch, isFetching, error } = useGetIntroduce();

  if (isFetching) {
    return <LoadingScreen />;
  }

  const entityData = data?.data;
  const hasIntroduce = !error && !!entityData;

  return (
    <IntroduceForm
      mode={hasIntroduce ? "readonly" : "create"}
      id={entityData?.id ?? undefined}
      entityData={entityData}
      refetch={refetch}
    />
  );
};

export const IntroduceNavigationRoute = {
  element: <Introduce />,
  path: "/landing/introduce"
};

export default Introduce;
