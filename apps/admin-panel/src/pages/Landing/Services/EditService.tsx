import { useLocation } from "react-router-dom";
import { ServiceForm } from "@/components/forms";

const EditService = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <ServiceForm mode="edit" id={id} onSuccessNavigate="/landing/services" />
  );
};

export const EditServiceNavigationRoute = {
  element: <EditService />,
  path: "/landing/services/edit"
};

export default EditService;
