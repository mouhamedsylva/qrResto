import React from 'react';
import { QrCode, Calendar, Palette, Eye, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  
  const tabs = [
    { id: 'tables', label: t('tables.tabTables'), icon: QrCode },
    { id: 'reservations', label: t('tables.tabReservations'), icon: Calendar },
    { id: 'qr-custom', label: t('tables.tabQrCustom'), icon: Palette },
    { id: 'preview', label: t('tables.tabPreview'), icon: Eye },
    { id: 'print', label: t('tables.tabPrint'), icon: Printer },
  ];

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-button ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
