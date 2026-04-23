import React from 'react';

interface ElegantBeigeTemplateProps {
  qrCodeUrl: string;
  restaurantName: string;
  tableNumber?: string;
}

/**
 * Template inspiré de l'image 4: Design élégant beige vintage
 * Format: A6 portrait (105mm x 148mm)
 * Style: Vintage avec ornements décoratifs
 */
const ElegantBeigeTemplate: React.FC<ElegantBeigeTemplateProps> = ({
  qrCodeUrl,
  restaurantName,
  tableNumber,
}) => {
  return (
    <div
      style={{
        width: '105mm',
        height: '148mm',
        background: '#F5E6D3',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Playfair Display", Georgia, serif',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Ornement décoratif en haut */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <svg
          width="120"
          height="30"
          viewBox="0 0 120 30"
          style={{ display: 'block', margin: '0 auto' }}
        >
          <path
            d="M 10 15 Q 20 5, 30 15 T 50 15 T 70 15 T 90 15 T 110 15"
            stroke="#2C2C2C"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="60" cy="15" r="4" fill="#2C2C2C" />
          <circle cx="40" cy="15" r="3" fill="#2C2C2C" />
          <circle cx="80" cy="15" r="3" fill="#2C2C2C" />
        </svg>
      </div>

      {/* QR Code avec cadre blanc */}
      <div
        style={{
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={qrCodeUrl}
          alt="QR Code"
          style={{
            width: '100%',
            maxWidth: '180px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>

      {/* Texte principal */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <p
          style={{
            fontSize: '28px',
            color: '#2C2C2C',
            margin: 0,
            marginBottom: '5px',
            fontWeight: 'normal',
            fontStyle: 'italic',
          }}
        >
          Scan to view our
        </p>
        <h1
          style={{
            fontSize: '42px',
            color: '#2C2C2C',
            margin: 0,
            fontWeight: 'bold',
            fontFamily: '"Brush Script MT", cursive',
            letterSpacing: '1px',
          }}
        >
          MENU
        </h1>
      </div>

      {/* Ligne décorative */}
      <div
        style={{
          width: '80%',
          height: '2px',
          background: '#2C2C2C',
          margin: '15px auto',
        }}
      />

      {/* Nom du restaurant */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p
          style={{
            fontSize: '18px',
            color: '#2C2C2C',
            margin: 0,
            marginBottom: '5px',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          {restaurantName}
        </p>
        {tableNumber && (
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              margin: 0,
            }}
          >
            Table {tableNumber}
          </p>
        )}
      </div>

      {/* Ornement décoratif en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <svg width="60" height="20" viewBox="0 0 60 20">
          <circle cx="10" cy="10" r="3" fill="#2C2C2C" />
          <circle cx="30" cy="10" r="4" fill="#2C2C2C" />
          <circle cx="50" cy="10" r="3" fill="#2C2C2C" />
          <line x1="13" y1="10" x2="27" y2="10" stroke="#2C2C2C" strokeWidth="1.5" />
          <line x1="33" y1="10" x2="47" y2="10" stroke="#2C2C2C" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};

export default ElegantBeigeTemplate;
