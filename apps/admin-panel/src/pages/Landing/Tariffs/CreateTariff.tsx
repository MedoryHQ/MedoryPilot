import { TariffForm } from "@/components/forms";

const CreateTariff = () => {
  return <TariffForm mode="create" onSuccessNavigate="/landing/tariffs" />;
};

export const CreateTariffNavigationRoute = {
  element: <CreateTariff />,
  path: "/landing/tariffs/create"
};

export default CreateTariff;
