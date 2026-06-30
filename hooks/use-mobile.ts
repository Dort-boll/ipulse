import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    const timerId = setTimeout(() => {
      const initialCheck = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(prev => prev !== initialCheck ? initialCheck : prev);
    }, 0);
    return () => {
      mql.removeEventListener("change", onChange);
      clearTimeout(timerId);
    }
  }, [])

  return !!isMobile
}
