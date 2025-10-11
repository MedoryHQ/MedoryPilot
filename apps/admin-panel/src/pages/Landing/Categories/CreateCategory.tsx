import { CategoryForm } from "@/components/forms";

const CreateCategory = () => {
  return <CategoryForm mode="create" onSuccessNavigate="/landing/categories" />;
};

export const CreateCategoryNavigationRoute = {
  element: <CreateCategory />,
  path: "/landing/categories/create"
};

export default CreateCategory;
