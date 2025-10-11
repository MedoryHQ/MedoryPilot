import { useLocation } from "react-router-dom";
import { CategoryForm } from "@/components/forms";

const EditCategory = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return (
    <CategoryForm mode="edit" id={id} onSuccessNavigate="/landing/categories" />
  );
};

export const EditCategoryNavigationRoute = {
  element: <EditCategory />,
  path: "/landing/categories/edit"
};

export default EditCategory;
