import { useLocation } from "react-router-dom";
import { HeaderForm } from "@/components/forms";

const EditHeader = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <HeaderForm mode="edit" id={id} onSuccessNavigate="/landing/headers" />
  );
};

export const EditHeaderNavigationRoute = {
  element: <EditHeader />,
  path: "/landing/headers/edit"
};

export default EditHeader;
