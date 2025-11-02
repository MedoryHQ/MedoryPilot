import { useLocation } from "react-router-dom";
import { ExperienceForm } from "@/components/forms";

const EditExperience = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <ExperienceForm
      mode="edit"
      id={id}
      onSuccessNavigate="/landing/experiences"
    />
  );
};

export const EditExperienceNavigationRoute = {
  element: <EditExperience />,
  path: "/landing/experiences/edit"
};

export default EditExperience;
