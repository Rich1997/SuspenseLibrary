import { useEffect } from 'react';

const DEFAULT_TITLE = 'Suspense Library';
const TITLE_SUFFIX = ' - Suspense Library';

/**
 * Custom hook to dynamically set document.title formatted as `${title} - Suspense Library`.
 *
 * @param title - Page-specific title string. If empty or omitted, defaults to "Suspense Library".
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (title && title.trim()) {
      const cleanTitle = title.trim();
      document.title = cleanTitle.endsWith(TITLE_SUFFIX)
        ? cleanTitle
        : `${cleanTitle}${TITLE_SUFFIX}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [title]);
}
