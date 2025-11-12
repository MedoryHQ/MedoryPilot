import { Footer, Header, Shell } from "@/components";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow mt-25 mb-10 md:mb-14 xl:mb-20">
        <section className="wrapper h-full px-4 md:px-6">
          <Shell>{children}</Shell>
        </section>
      </main>
      <Footer />
    </div>
  );
}
