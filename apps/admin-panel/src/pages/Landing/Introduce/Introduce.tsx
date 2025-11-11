import { useGetIntroduce } from "@/libs/queries";
import IntroduceForm from "@/components/forms/pageForms/IntroduceForm";

const Introduce = () => {
  const { data, refetch, isFetching, error } = useGetIntroduce();

  if (isFetching) {
    return (
      <div className="absolute inset-0 flex min-h-screen w-full items-center justify-center">
        loading...
      </div>
    );
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
