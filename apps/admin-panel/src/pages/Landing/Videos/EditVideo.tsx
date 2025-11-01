import { useLocation } from "react-router-dom";
import { VideoForm } from "@/components/forms";

const EditVideo = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return <VideoForm mode="edit" id={id} onSuccessNavigate="/landing/videos" />;
};

export const EditVideoNavigationRoute = {
  element: <EditVideo />,
  path: "/landing/videos/edit"
};

export default EditVideo;
