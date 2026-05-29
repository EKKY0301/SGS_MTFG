"use client";

import { useEffect, useState } from "react";

export function useSectionHash(defaultHash?: string) {
  const [active, setActive] = useState(defaultHash || "");

  // escuchar hash real del navegador
  useEffect(() => {
    const update = () => {
      const h = window.location.hash.replace("#", "");
      if (h) setActive(h);
    };
    update();

    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  // setter manual para clicks repetidos
  const forceSet = (value: string) => {
    setActive(value);
    window.location.hash = value; // actualiza nav
  };

  return { active, setActive: forceSet };
}
