import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';

// Self-contained toast system. Deliberately dependency-free (no shadcn/radix
// toast wiring): plain context + fixed-position container + inline styles, so
// it works regardless of what's already set up in the shared CSS file.
//
// Note: this is separate from hooks/use-toast.ts (the shadcn one). Import
// `useToast` from this file when you want reminder-style toasts.

type ToastItem = { id: string; title: string; message?: string; tone: 'reminder' | 'overdue' };

const ToastContext = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const toastContainerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 1000,
  maxWidth: 320,
  pointerEvents: 'none',
};

function toastCardStyle(tone: ToastItem['tone']): CSSProperties {
  return {
    pointerEvents: 'auto',
    background: tone === 'overdue' ? '#111111' : '#ffffff',
    color: tone === 'overdue' ? '#ffffff' : '#111111',
    border: tone === 'overdue' ? 'none' : '1px solid #e5e5e5',
    borderRadius: 10,
    padding: '12px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
    animation: 'zana-toast-in 0.2s ease-out',
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 8000);
  };

  const dismiss = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div style={toastContainerStyle}>
        <style>{`@keyframes zana-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {toasts.map(t => (
          <div key={t.id} style={toastCardStyle(t.tone)} data-testid={`toast-${t.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <strong style={{ fontSize: 13 }}>{t.title}</strong>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                data-testid={`button-dismiss-toast-${t.id}`}
                style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: 0, lineHeight: 0 }}
              >
                <X size={13} />
              </button>
            </div>
            {t.message && (
              <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>{t.message}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
