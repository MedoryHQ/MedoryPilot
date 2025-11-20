"use client";
import { cn } from "@/utils";
import { Skeleton as HeroUISkeleton } from "@heroui/react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeroUISkeleton
      className={cn("rounded-md bg-gray-100", className)}
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

export { Skeleton, HeroSkeletion };
