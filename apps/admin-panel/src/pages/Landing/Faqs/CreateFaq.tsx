import { HeaderForm } from "@/components/forms";

const CreateHeader = () => {
  return <HeaderForm mode="create" onSuccessNavigate="/landing/headers" />;
};

export const CreateHeaderNavigationRoute = {
  element: <CreateHeader />,
  path: "/landing/headers/create"
};

export default CreateHeader;
