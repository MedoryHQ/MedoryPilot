import { SocialForm } from "@/components/forms";

const CreateSocial = () => {
  return <SocialForm mode="create" onSuccessNavigate="/landing/socials" />;
};

export const CreateSocialNavigationRoute = {
  element: <CreateSocial />,
  path: "/landing/socials/create"
};

export default CreateSocial;
