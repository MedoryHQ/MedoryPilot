"use client";
import { useParams } from "next/navigation";
import * as React from "react";

const NewsSlugPage: React.FC = () => {
  const params = useParams<{ slug: string }>();

  return (
    <main className="py-20 px-4 container mx-auto  xl:px-0 ">
      {params.slug}
    </main>
  );
};

export default NewsSlugPage;
