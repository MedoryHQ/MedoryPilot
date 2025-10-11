import { useLocation } from "react-router-dom";
import { TariffForm } from "@/components/forms";

const EditTariff = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <TariffForm mode="edit" id={id} onSuccessNavigate="/landing/tariffs" />
  );
};

export const EditTariffNavigationRoute = {
  element: <EditTariff />,
  path: "/landing/tariffs/edit"
};

export default EditTariff;
