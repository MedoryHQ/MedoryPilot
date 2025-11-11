import { LoadingScreen } from "@/components";
import { ContactForm } from "@/components/forms";
import { useGetContact } from "@/libs/queries";

const Contact = () => {
  const { data, refetch, isFetching, error } = useGetContact();

  if (isFetching) {
    return <LoadingScreen />;
  }

  const entityData = data?.data;
  const hasContact = !error && !!entityData;

  return (
    <ContactForm
      mode={hasContact ? "readonly" : "create"}
      id={entityData?.id ?? undefined}
      entityData={entityData}
      refetch={refetch}
    />
  );
};

export const ContactNavigationRoute = {
  element: <Contact />,
  path: "/landing/contact"
};

export default Contact;
