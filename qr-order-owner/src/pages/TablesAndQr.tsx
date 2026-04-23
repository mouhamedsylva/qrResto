import React, { useState } from 'react';
import Layout from '../components/Layout';
import TabNavigation from '../components/tables/TabNavigation';
import TablesGrid from '../components/tables/TablesGrid';
import ReservationsList from '../components/tables/reservations/ReservationsList';
import SimpleQrGenerator from '../components/tables/qr/SimpleQrGenerator';
import MenuPreview from '../components/tables/preview/MenuPreview';
import PrintTemplates from '../components/tables/print/PrintTemplates';
import { useLanguage } from '../context/LanguageContext';
import '../styles/TablesAndQr.css';

const TablesAndQr: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('tables');

  console.log('🔍 TablesAndQr: activeTab =', activeTab);

  return (
    <Layout
      title={t('tables.title')}
      subtitle={t('tables.subtitle')}
    >
      {/* Navigation par onglets */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'tables' && <TablesGrid />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'qr-custom' && <SimpleQrGenerator />}
        {activeTab === 'preview' && <MenuPreview />}
        {activeTab === 'print' && <PrintTemplates />}
      </div>
    </Layout>
  );
};

export default TablesAndQr;
