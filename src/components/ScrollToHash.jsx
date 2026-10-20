import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [hash, pathname]);

  return null;
}
