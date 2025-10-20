import { NewsForm } from "@/components/forms";

const CreateNews = () => {
  return <NewsForm mode="create" onSuccessNavigate="/landing/newses" />;
};

export const CreateNewsNavigationRoute = {
  element: <CreateNews />,
  path: "/landing/newses/create"
};

export default CreateNews;
