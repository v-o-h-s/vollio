"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizzesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/knowledge-test");
  }, [router]);
  return null;
}

