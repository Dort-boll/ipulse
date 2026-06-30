import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkViewport();

    // Resize event listener
    window.addEventListener("resize", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, [breakpoint]);

  return isMobile;
}
