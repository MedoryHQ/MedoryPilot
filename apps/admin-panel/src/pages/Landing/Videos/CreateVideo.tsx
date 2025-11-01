import { VideoForm } from "@/components/forms";

const CreateVideo = () => {
  return <VideoForm mode="create" onSuccessNavigate="/landing/videos" />;
};

export const CreateVideoNavigationRoute = {
  element: <CreateVideo />,
  path: "/landing/videos/create"
};

export default CreateVideo;
