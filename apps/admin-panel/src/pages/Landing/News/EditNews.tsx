import { useLocation } from "react-router-dom";
import { NewsForm } from "@/components/forms";

const EditNews = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get("slug") || "";

  return (
    <NewsForm mode="edit" slug={slug} onSuccessNavigate="/landing/newses" />
  );
};

export const EditNewsNavigationRoute = {
  element: <EditNews />,
  path: "/landing/newses/edit"
};

export default EditNews;
