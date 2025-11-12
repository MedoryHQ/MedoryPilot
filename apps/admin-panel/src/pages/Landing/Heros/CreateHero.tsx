import { HeroForm } from "@/components/forms";

const CreateHero = () => {
  return <HeroForm mode="create" onSuccessNavigate="/landing/heros" />;
};

export const CreateHeroNavigationRoute = {
  element: <CreateHero />,
  path: "/landing/heros/create"
};

export default CreateHero;
