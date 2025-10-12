import { useLocation } from "react-router-dom";
import { SocialForm } from "@/components/forms";

const EditSocial = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <SocialForm mode="edit" id={id} onSuccessNavigate="/landing/socials" />
  );
};

export const EditSocialNavigationRoute = {
  element: <EditSocial />,
  path: "/landing/socials/edit"
};

export default EditSocial;
