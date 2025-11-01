import { useLocation } from "react-router-dom";
import { EducationForm } from "@/components/forms";

const EditEducation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <EducationForm
      mode="edit"
      id={id}
      onSuccessNavigate="/landing/educations"
    />
  );
};

export const EditEducationNavigationRoute = {
  element: <EditEducation />,
  path: "/landing/educations/edit"
};

export default EditEducation;
