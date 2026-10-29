import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Only scroll if there's no hash target (or scroll to top if hash is empty)
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, search]);

  return null;
}
