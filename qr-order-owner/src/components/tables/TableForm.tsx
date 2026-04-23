import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TableFormProps {
  onSubmit: (number: string) => Promise<boolean>;
}

const TableForm: React.FC<TableFormProps> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(number.trim());
    setIsSubmitting(false);
    
    if (success) {
      setNumber('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        <Plus size={16} />
        {t('tables.newTable')}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="table-form-inline">
      <input
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder={t('tables.tableNumberPlaceholder')}
        autoFocus
        className="table-form-input"
      />
      
      <button
        type="submit"
        disabled={isSubmitting || !number.trim()}
        className="table-form-btn table-form-btn-submit"
      >
        {isSubmitting ? t('tables.creating') : t('tables.create')}
      </button>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          setNumber('');
        }}
        className="table-form-btn table-form-btn-cancel"
      >
        <X size={20} />
      </button>
    </form>
  );
};

export default TableForm;
