import { FaqForm } from "@/components/forms";

const CreateFaq = () => {
  return <FaqForm mode="create" onSuccessNavigate="/landing/faqs" />;
};

export const CreateFaqNavigationRoute = {
  element: <CreateFaq />,
  path: "/landing/faqs/create"
};

export default CreateFaq;
