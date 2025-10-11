import { CategoryForm } from "@/components/forms";

const CreateCategory = () => {
  return <CategoryForm mode="create" onSuccessNavigate="/landing/categorys" />;
};

export const CreateCategoryNavigationRoute = {
  element: <CreateCategory />,
  path: "/landing/categorys/create"
};

export default CreateCategory;
