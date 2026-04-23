import React from 'react';
import DiagonalBurgundyTemplate from './templates/DiagonalBurgundyTemplate';
import GeometricModernTemplate from './templates/GeometricModernTemplate';
import MinimalGreenTemplate from './templates/MinimalGreenTemplate';
import ElegantBeigeTemplate from './templates/ElegantBeigeTemplate';

interface PrintableTemplateRendererProps {
  templateId: string;
  qrCodeUrl: string;
  restaurantName: string;
  tableNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
}

const PrintableTemplateRenderer: React.FC<PrintableTemplateRendererProps> = ({
  templateId,
  qrCodeUrl,
  restaurantName,
  tableNumber,
  phone,
  email,
  website,
}) => {
  const renderTemplate = () => {
    switch (templateId) {
      case 'tent-diagonal-burgundy':
        return (
          <DiagonalBurgundyTemplate
            qrCodeUrl={qrCodeUrl}
            restaurantName={restaurantName}
            tableNumber={tableNumber}
            phone={phone}
            email={email}
            website={website}
          />
        );

      case 'tent-modern-geometric':
        return (
          <GeometricModernTemplate
            qrCodeUrl={qrCodeUrl}
            restaurantName={restaurantName}
            tableNumber={tableNumber}
            website={website}
          />
        );

      case 'tent-minimal-green':
        return (
          <MinimalGreenTemplate
            qrCodeUrl={qrCodeUrl}
            restaurantName={restaurantName}
            tableNumber={tableNumber}
          />
        );

      case 'tent-elegant-beige':
        return (
          <ElegantBeigeTemplate
            qrCodeUrl={qrCodeUrl}
            restaurantName={restaurantName}
            tableNumber={tableNumber}
          />
        );

      default:
        return (
          <div
            style={{
              width: '148mm',
              height: '210mm',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Arial, sans-serif',
              color: '#666',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                Template en cours de développement
              </p>
              <p style={{ fontSize: '14px' }}>
                ID: {templateId}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        background: '#f5f5f5',
        minHeight: '400px',
      }}
    >
      {renderTemplate()}
    </div>
  );
};

export default PrintableTemplateRenderer;
