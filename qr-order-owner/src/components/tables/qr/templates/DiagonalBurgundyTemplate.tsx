import React from 'react';

interface DiagonalBurgundyTemplateProps {
  qrCodeUrl: string;
  restaurantName: string;
  tableNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Template inspiré de l'image 1: Design diagonal élégant bordeaux
 * Format: A5 portrait (148mm x 210mm)
 * Style: Professionnel avec section diagonale
 */
const DiagonalBurgundyTemplate: React.FC<DiagonalBurgundyTemplateProps> = ({
  qrCodeUrl,
  restaurantName,
  tableNumber,
  phone,
  email,
  website,
}) => {
  return (
    <div
      style={{
        width: '148mm',
        height: '210mm',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Section supérieure blanche avec QR code */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          zIndex: 2,
        }}
      >
        {/* Bordure décorative autour du QR */}
        <div
          style={{
            border: '4px solid #6B1B3D',
            borderRadius: '8px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 4px 12px rgba(107, 27, 61, 0.15)',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{
              width: '180px',
              height: '180px',
              display: 'block',
            }}
          />
        </div>

        {/* Texte d'appel à l'action */}
        <div
          style={{
            marginTop: '25px',
            textAlign: 'right',
            width: '100%',
            paddingRight: '20px',
          }}
        >
          <p
            style={{
              fontSize: '18px',
              fontStyle: 'italic',
              color: '#6B1B3D',
              margin: 0,
              marginBottom: '5px',
            }}
          >
            Flashez-moi
          </p>
          <p
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#8B3D5D',
              margin: 0,
            }}
          >
            pour découvrir
          </p>
          <p
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#8B3D5D',
              margin: 0,
            }}
          >
            notre menu
          </p>
        </div>
      </div>

      {/* Section diagonale bordeaux */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(135deg, #6B1B3D 0%, #8B3D5D 100%)',
          clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '40px 30px 30px',
          color: 'white',
          zIndex: 1,
        }}
      >
        {/* Nom du restaurant */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'normal',
            margin: 0,
            marginBottom: '30px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            letterSpacing: '1px',
          }}
        >
          {restaurantName}
        </h1>

        {/* Informations de contact */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            lineHeight: '1.8',
            opacity: 0.95,
          }}
        >
          {phone && (
            <p style={{ margin: '5px 0' }}>
              <strong>Tél :</strong> {phone}
            </p>
          )}
          {email && (
            <p style={{ margin: '5px 0' }}>
              {email}
            </p>
          )}
          {website && (
            <p style={{ margin: '5px 0' }}>
              {website}
            </p>
          )}
        </div>

        {/* Numéro de table si présent */}
        {tableNumber && (
          <div
            style={{
              marginTop: '20px',
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Table {tableNumber}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagonalBurgundyTemplate;
