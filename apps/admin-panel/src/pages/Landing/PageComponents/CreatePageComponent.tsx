import { PageComponentForm } from "@/components/forms";

const CreatePageComponent = () => {
  return (
    <PageComponentForm
      mode="create"
      onSuccessNavigate="/landing/page-components"
    />
  );
};

export const CreatePageComponentNavigationRoute = {
  element: <CreatePageComponent />,
  path: "/landing/page-components/create"
};

export default CreatePageComponent;
