import { EducationForm } from "@/components/forms";

const CreateEducation = () => {
  return (
    <EducationForm mode="create" onSuccessNavigate="/landing/educations" />
  );
};

export const CreateEducationNavigationRoute = {
  element: <CreateEducation />,
  path: "/landing/educations/create"
};

export default CreateEducation;
