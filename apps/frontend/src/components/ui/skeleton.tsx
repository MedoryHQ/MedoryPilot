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

export { Skeleton, HeroSkeletion, IntroduceSkeletion, ServiceSkeletion };
