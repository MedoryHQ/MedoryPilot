import { useLocation } from "react-router-dom";
import { PageComponentForm } from "@/components/forms";

const EditPageComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get("slug") || "";

  return (
    <PageComponentForm
      mode="edit"
      slug={slug}
      onSuccessNavigate="/landing/page-components"
    />
  );
};

export const EditPageComponentNavigationRoute = {
  element: <EditPageComponent />,
  path: "/landing/page-components/edit"
};

export default EditPageComponent;
