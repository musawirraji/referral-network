'use client';

import { useEffect } from 'react';
import { useToastStore } from '@/lib/store';

export default function Toast() {
  const { toast, hideToast } = useToastStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  // The live region stays mounted so screen readers announce new messages.
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" className="toast-close" onClick={hideToast} aria-label="Dismiss">×</button>
        </div>
      )}
    </div>
  );
}
