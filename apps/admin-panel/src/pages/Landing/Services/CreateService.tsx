import { ServiceForm } from "@/components/forms";

const CreateService = () => {
  return <ServiceForm mode="create" onSuccessNavigate="/landing/services" />;
};

export const CreateServiceNavigationRoute = {
  element: <CreateService />,
  path: "/landing/services/create"
};

export default CreateService;
