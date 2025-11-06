// import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { Button, Input } from "./ui";

const Footer = () => {
  // const t = useTranslations("Footer");

  return (
    <footer className="bg-card dark:bg-background border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl dark:shadow-glow-green" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3"></div>

            <div className="flex gap-3">{/* Social Icons */}</div>
          </div>

          <div>{/* Quick Links */}</div>

          <div>{/* Services */}</div>

          <div>{/* Legal */}</div>
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Bottom Bar */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
