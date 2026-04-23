import React from 'react';

interface MinimalGreenTemplateProps {
  qrCodeUrl: string;
  restaurantName: string;
  tableNumber?: string;
}

/**
 * Template inspiré de l'image 3: Design minimaliste vert
 * Format: A5 portrait (148mm x 210mm)
 * Style: Épuré avec bordure verte et illustrations légères
 */
const MinimalGreenTemplate: React.FC<MinimalGreenTemplateProps> = ({
  qrCodeUrl,
  restaurantName,
  tableNumber,
}) => {
  return (
    <div
      style={{
        width: '148mm',
        height: '210mm',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Brush Script MT", cursive',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '25px',
        boxSizing: 'border-box',
      }}
    >
      {/* Illustrations décoratives en arrière-plan */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          opacity: 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='20' cy='20' r='15' fill='%2348A868'/%3E%3Ccircle cx='80' cy='30' r='10' fill='%2348A868'/%3E%3Ccircle cx='30' cy='70' r='12' fill='%2348A868'/%3E%3Ccircle cx='75' cy='80' r='8' fill='%2348A868'/%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          backgroundRepeat: 'repeat',
          pointerEvents: 'none',
        }}
      />

      {/* Contenu principal */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Titre principal */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h1
            style={{
              fontSize: '42px',
              color: '#48A868',
              margin: 0,
              marginBottom: '10px',
              fontWeight: 'normal',
              lineHeight: 1.2,
            }}
          >
            Scan to
          </h1>
          <h1
            style={{
              fontSize: '42px',
              color: '#48A868',
              margin: 0,
              fontWeight: 'normal',
              lineHeight: 1.2,
            }}
          >
            view Menu
          </h1>
        </div>

        {/* QR Code avec bordure verte */}
        <div
          style={{
            border: '6px solid #48A868',
            borderRadius: '12px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 4px 16px rgba(72, 168, 104, 0.2)',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{
              width: '200px',
              height: '200px',
              display: 'block',
            }}
          />
        </div>

        {/* Message de sécurité */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '24px',
              color: '#48A868',
              margin: 0,
              marginBottom: '15px',
              fontWeight: 'normal',
            }}
          >
            We care about your safety
          </p>

          {/* Icônes décoratives */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '35px',
                height: '35px',
                border: '3px solid #48A868',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🔍
            </div>
            <div
              style={{
                width: '35px',
                height: '35px',
                border: '3px solid #48A868',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              📷
            </div>
          </div>
        </div>

        {/* Bande verte en bas */}
        <div
          style={{
            width: 'calc(100% + 50px)',
            marginLeft: '-25px',
            marginRight: '-25px',
            marginBottom: '-25px',
            background: '#48A868',
            padding: '15px 25px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <p
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '3px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {restaurantName}
          </p>
          {tableNumber && (
            <p
              style={{
                fontSize: '14px',
                margin: 0,
                opacity: 0.9,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Table {tableNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalGreenTemplate;
