"use client";
import { cn } from "@/utils";
import { Skeleton as HeroUISkeleton } from "@heroui/react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeroUISkeleton
      className={cn("rounded-md bg-white", className)}
      {...props}
    />
  );
}

const HeroSkeletion = () => {
  return (
    <section
      id="home"
      className="relative pt-8 overflow-hidden mb-6 md:mb-8 lg:mb-10 max-w-[1440px] w-full wrapper h-full px-4 md:px-6 2xl:px-0"
    >
      <div className="mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="rounded-4xl p-8 h-[700px]" />
          <Skeleton className="rounded-4xl p-8 h-[700px]" />
        </div>
      </div>
    </section>
  );
};

const IntroduceSkeletion = () => {
  return (
    <section
      id="introduce"
      className="py-24 lg:py-40 flex flex-col w-full items-center max-w-[1440px] wrapper h-full px-4 md:px-6"
    >
      <Skeleton className="h-11 md:h-[55px] xl:h-[70px] w-full mb-8 max-w-2xl" />
      <div className="flex flex-col gap-1.5 md:gap-2 max-w-4xl w-full">
        <Skeleton className="h-[18px] md:h-[22px]" />
        <Skeleton className="h-[18px] md:h-[22px]" />
      </div>
      <Skeleton className="mt-10 md:mt-14 lg:mt-20 max-w-6xl w-full h-full aspect-video" />
    </section>
  );
};

const ServiceSkeletion = () => {
  return (
    <section
      id="introduce"
      className="mx-auto z-1 max-w-[1440px] h-full px-4 md:px-6 2xl:px-0"
    >
      <div className="text-center mx-auto mb-12 lg:mb-16 z-2 relative flex flex-col items-center justify-center w-full">
        <Skeleton className="h-11 md:h-[55px] xl:h-[70px] w-full mb-8 max-w-2xl bg-transparent" />
        <div className="flex flex-col gap-1.5 md:gap-2 max-w-4xl w-full">
          <Skeleton className="h-[18px] md:h-[22px] bg-transparent" />
          <Skeleton className="h-[18px] md:h-[22px] bg-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8 w-full mt-10">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="aspect-video bg-transparent w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsesSkeletion = () => {
  return (
    <section id="newses">
      <Skeleton className="w-full max-w-[1440px] mx-auto relative h-[210px] md:h-[450px] lg:h-[550px] rounded-md md:rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer" />
      <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-10">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton
            key={idx}
            className="relative w-10 h-10 md:w-16 md:h-16 border-border/50 opacity-70 hover:opacity-100 hover:scale-105 rounded-full overflow-hidden border-2 md:border-3 transition-all duration-300 focus:outline-none"
          />
        ))}
      </div>
    </section>
  );
};

const FAQsSkeleton: React.FC = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 w-full bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 xl:gap-24 items-center">
          <div className="relative hidden lg:block">
            <Skeleton className="rounded-3xl p-6 h-[600px] w-full" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          <div>
            <div className="mb-12 flex flex-col items-center lg:items-start">
              <Skeleton className="h-10 md:h-[55px] xl:h-[70px] w-full mb-4 max-w-2xl" />
              <Skeleton className="h-[18px] md:h-[22px] w-full max-w-3xl" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-[76px]"></Skeleton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export {
  Skeleton,
  HeroSkeletion,
  IntroduceSkeletion,
  ServiceSkeletion,
  NewsesSkeletion,
  FAQsSkeleton,
};
