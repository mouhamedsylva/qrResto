import React from 'react';
import { Utensils } from 'lucide-react';

interface GeometricModernTemplateProps {
  qrCodeUrl: string;
  restaurantName: string;
  tableNumber?: string;
  website?: string;
}

/**
 * Template inspiré de l'image 2: Design géométrique moderne
 * Format: A6 portrait (105mm x 148mm)
 * Style: Blocs de couleurs rouge, noir, beige
 */
const GeometricModernTemplate: React.FC<GeometricModernTemplateProps> = ({
  qrCodeUrl,
  restaurantName,
  tableNumber,
  website,
}) => {
  return (
    <div
      style={{
        width: '105mm',
        height: '148mm',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Triangle rouge en haut à gauche */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: '120px solid #D32F2F',
          borderBottom: '80px solid transparent',
          zIndex: 1,
        }}
      />

      {/* Triangle beige en haut à droite */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderRight: '100px solid #E8D5B7',
          borderBottom: '80px solid transparent',
          zIndex: 1,
        }}
      />

      {/* Section centrale noire */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: 0,
          right: 0,
          height: '50%',
          background: '#2C2C2C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '25px',
          zIndex: 2,
        }}
      >
        {/* Icône couverts */}
        <div style={{ color: 'white', marginBottom: '15px' }}>
          <Utensils size={36} strokeWidth={1.5} />
        </div>

        {/* Texte principal */}
        <h2
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: 0,
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          SCAN TO VIEW MENU
        </h2>

        {/* QR Code avec fond blanc */}
        <div
          style={{
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{
              width: '140px',
              height: '140px',
              display: 'block',
            }}
          />
        </div>

        {/* Texte alternatif */}
        <p
          style={{
            color: 'white',
            fontSize: '11px',
            margin: 0,
            opacity: 0.8,
            textAlign: 'center',
          }}
        >
          Or visit {website || 'www.your-restaurant-name.com'}
        </p>
      </div>

      {/* Bande rouge en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '15%',
          background: '#D32F2F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '3px',
            }}
          >
            {restaurantName}
          </p>
          {tableNumber && (
            <p
              style={{
                fontSize: '12px',
                margin: 0,
                opacity: 0.9,
              }}
            >
              Table {tableNumber}
            </p>
          )}
        </div>
      </div>

      {/* Ligne décorative dorée */}
      <div
        style={{
          position: 'absolute',
          top: '24.5%',
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #D4AF37 0%, #F4E5C3 50%, #D4AF37 100%)',
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '14.5%',
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #D4AF37 0%, #F4E5C3 50%, #D4AF37 100%)',
          zIndex: 3,
        }}
      />
    </div>
  );
};

export default GeometricModernTemplate;
