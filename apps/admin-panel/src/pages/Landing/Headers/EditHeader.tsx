import { useNavigate, useLocation } from "react-router-dom";
import { HeaderFormActions } from "@/components/header";

const EditHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <HeaderFormActions
      mode="edit"
      id={id}
      isSubmitting={false}
      onCancel={() => navigate("/landing/headers")}
    />
  );
};

export const EditHeaderNavigationRoute = {
  element: <EditHeader />,
  path: "/landing/headers/edit"
};

export default EditHeader;
