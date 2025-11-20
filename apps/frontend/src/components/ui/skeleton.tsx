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

export { Skeleton, HeroSkeletion, IntroduceSkeletion };
