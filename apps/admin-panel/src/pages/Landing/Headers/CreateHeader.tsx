import { useNavigate } from "react-router-dom";
import { HeaderFormActions } from "@/components/header";

const CreateHeader = () => {
  const navigate = useNavigate();

  return (
    <HeaderFormActions
      mode="create"
      isSubmitting={false}
      onCancel={() => navigate("/landing/headers")}
    />
  );
};

export const CreateHeaderNavigationRoute = {
  element: <CreateHeader />,
  path: "/landing/headers/create"
};

export default CreateHeader;
