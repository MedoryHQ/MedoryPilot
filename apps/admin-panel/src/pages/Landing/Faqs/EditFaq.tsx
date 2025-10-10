import { useLocation } from "react-router-dom";
import { FaqForm } from "@/components/forms";

const EditFaq = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return <FaqForm mode="edit" id={id} onSuccessNavigate="/landing/faqs" />;
};

export const EditFaqNavigationRoute = {
  element: <EditFaq />,
  path: "/landing/faqs/edit"
};

export default EditFaq;
