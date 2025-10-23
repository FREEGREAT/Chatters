"use client";

import { useEffect, useRef } from "react";

export default function useAutoScroll() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  return { ref };
}
