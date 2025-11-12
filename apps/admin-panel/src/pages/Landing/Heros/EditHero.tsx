import { useLocation } from "react-router-dom";
import { HeroForm } from "@/components/forms";

const EditHero = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";

  return <HeroForm mode="edit" id={id} onSuccessNavigate="/landing/heros" />;
};

export const EditHeroNavigationRoute = {
  element: <EditHero />,
  path: "/landing/heros/edit"
};

export default EditHero;
