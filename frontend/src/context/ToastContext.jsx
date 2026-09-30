/**
 * Toast/notification context.
 *
 * Provides `notify(message, type)` for surfacing success and error messages
 * consistently across the app. Toasts auto-dismiss after a few seconds and are
 * announced to assistive technology.
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import './ToastContext.css';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  /**
   * Show a toast.
   *
   * @param {string} message - Text to display.
   * @param {'success'|'error'|'info'} [type] - Visual style.
   */
  const notify = useCallback(
    (message, type = 'info') => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, type }]);
      // Auto-dismiss after 4 seconds.
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Live region so screen readers announce new messages. */}
      <div className="toast-container" aria-live="assertive" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <span>{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to trigger toasts.
 *
 * @returns {{ notify: Function }}
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
