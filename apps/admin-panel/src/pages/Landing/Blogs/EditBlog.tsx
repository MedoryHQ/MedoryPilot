import { useLocation } from "react-router-dom";
import { BlogForm } from "@/components/forms";

const EditBlog = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get("slug") || "";

  return (
    <BlogForm mode="edit" slug={slug} onSuccessNavigate="/landing/blogs" />
  );
};

export const EditBlogNavigationRoute = {
  element: <EditBlog />,
  path: "/landing/blogs/edit"
};

export default EditBlog;
