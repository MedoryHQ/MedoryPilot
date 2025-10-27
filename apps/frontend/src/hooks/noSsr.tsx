import React, { ReactNode, useEffect, useState } from "react";

interface NoSsrProps {
  children: ReactNode;
}

export default function NoSsr({ children }: NoSsrProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}
