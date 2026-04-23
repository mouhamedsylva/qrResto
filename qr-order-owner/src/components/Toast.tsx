import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toastSuccess: (message: string, duration?: number) => void;
  toastError: (message: string, duration?: number) => void;
  toastInfo: (message: string, duration?: number) => void;
  toastWarning: (message: string, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const show = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  const value: ToastContextType = {
    toastSuccess: (m, d) => show('success', m, d),
    toastError:   (m, d) => show('error',   m, d),
    toastInfo:    (m, d) => show('info',    m, d),
    toastWarning: (m, d) => show('warning', m, d),
  };

  const styles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; color: string }> = {
    success: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)', color: '#10b981', icon: <Check size={16} /> },
    error:   { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.35)',  color: '#ef4444', icon: <X size={16} /> },
    info:    { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.35)', color: '#6366f1', icon: <Info size={16} /> },
    warning: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b', icon: <AlertCircle size={16} /> },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => {
          const s = styles[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                background: 'var(--surface-0, #fff)',
                border: `1px solid ${s.border}`,
                borderLeft: `4px solid ${s.color}`,
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-900, #111)',
                pointerEvents: 'all',
                animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                maxWidth: '100%',
              }}
            >
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
              }}>
                {s.icon}
              </div>
              {/* Message */}
              <span style={{ flex: 1, lineHeight: 1.5, paddingTop: 4 }}>{toast.message}</span>
              {/* Close */}
              <button
                onClick={() => dismiss(toast.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-400, #999)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 4,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
