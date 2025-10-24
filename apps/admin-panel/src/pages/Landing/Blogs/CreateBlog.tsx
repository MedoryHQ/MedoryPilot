import { BlogForm } from "@/components/forms";

const CreateBlog = () => {
  return <BlogForm mode="create" onSuccessNavigate="/landing/blogs" />;
};

export const CreateBlogNavigationRoute = {
  element: <CreateBlog />,
  path: "/landing/blogs/create"
};

export default CreateBlog;
