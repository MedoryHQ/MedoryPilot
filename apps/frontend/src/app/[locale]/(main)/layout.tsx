import { Footer, Header, Shell } from "@/components";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <section className="wrapper h-full">
          <Shell>{children}</Shell>
        </section>
      </main>
      <Footer />
    </div>
  );
}
