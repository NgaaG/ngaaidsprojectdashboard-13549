import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to manage viewer mode (lecturer) vs edit mode (student/owner)
 * Lecturers access with ?viewer=true in URL for read-only access
 */
export const useViewMode = () => {
  const [searchParams] = useSearchParams();
  const [isViewerMode, setIsViewerMode] = useState(false);

  useEffect(() => {
    const viewerParam = searchParams.get('viewer');
    if (viewerParam === 'true') {
      setIsViewerMode(true);
      // Store in sessionStorage so it persists across page navigation
      sessionStorage.setItem('viewer-mode', 'true');
    } else if (sessionStorage.getItem('viewer-mode') === 'true') {
      setIsViewerMode(true);
    }
  }, [searchParams]);

  return { isViewerMode };
};
