import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

interface UseResponsiveReturn {
  isMobile: boolean;
}

export function useResponsive(): UseResponsiveReturn {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);

    return () => mql.removeEventListener('change', handler);
  }, []);

  return { isMobile };
}
