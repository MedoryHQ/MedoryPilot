import { ExperienceForm } from "@/components/forms";

const CreateExperience = () => {
  return (
    <ExperienceForm mode="create" onSuccessNavigate="/landing/experiences" />
  );
};

export const CreateExperienceNavigationRoute = {
  element: <CreateExperience />,
  path: "/landing/experiences/create"
};

export default CreateExperience;
