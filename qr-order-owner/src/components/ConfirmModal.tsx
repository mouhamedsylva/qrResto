import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);
  const { t } = useLanguage();

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <div className={`confirm-modal-header variant-${options.type || 'danger'}`}>
              <div className="confirm-modal-icon">
                <AlertTriangle size={28} />
              </div>
              <button className="confirm-modal-close" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>
            
            <div className="confirm-modal-body">
              <h3>{options.title}</h3>
              <p>{options.message}</p>
            </div>
            
            <div className="confirm-modal-footer">
              <button className="confirm-btn-cancel" onClick={handleClose}>
                {options.cancelLabel || t('common.cancel')}
              </button>
              <button className={`confirm-btn-action variant-${options.type || 'danger'}`} onClick={handleConfirm}>
                {options.confirmLabel || t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};

// Re-export for compatibility if needed
export default ConfirmProvider;
