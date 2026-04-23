import React from 'react';
import { Utensils, Coffee, Wine } from 'lucide-react';
import type { QrTemplate } from './QrTemplates';

interface TemplatePreviewProps {
  template: QrTemplate;
  qrCodeUrl?: string;
  tableNumber?: string;
  restaurantName?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  qrCodeUrl,
  tableNumber,
  restaurantName = 'Restaurant',
}) => {
  const { design } = template;

  // Icône selon le template
  const renderIcon = () => {
    const iconProps = { size: 32, strokeWidth: 2 };
    switch (design.icon) {
      case 'utensils':
        return <Utensils {...iconProps} />;
      case 'coffee':
        return <Coffee {...iconProps} />;
      case 'wine':
        return <Wine {...iconProps} />;
      default:
        return null;
    }
  };

  // Style du background selon le pattern
  const getBackgroundStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      backgroundColor: design.backgroundColor,
    };

    if (design.pattern === 'gradient' && design.gradientStart && design.gradientEnd) {
      return {
        ...base,
        background: `linear-gradient(135deg, ${design.gradientStart} 0%, ${design.gradientEnd} 100%)`,
      };
    }

    if (design.pattern === 'dots') {
      return {
        ...base,
        backgroundImage: `radial-gradient(circle, ${design.accentColor || '#000'}22 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    }

    if (design.pattern === 'circles') {
      return {
        ...base,
        backgroundImage: `radial-gradient(circle, ${design.accentColor || '#000'}33 2px, transparent 2px)`,
        backgroundSize: '30px 30px',
      };
    }

    if (design.pattern === 'waves') {
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${design.accentColor || '#000'}22 10px, ${design.accentColor || '#000'}22 20px)`,
      };
    }

    return base;
  };

  // Style de la bordure
  const getBorderStyle = (): React.CSSProperties => {
    switch (design.borderStyle) {
      case 'solid':
        return {
          border: `3px solid ${design.accentColor || design.foregroundColor}`,
        };
      case 'dashed':
        return {
          border: `3px dashed ${design.accentColor || design.foregroundColor}`,
        };
      case 'rounded':
        return {
          border: `3px solid ${design.accentColor || design.foregroundColor}`,
          borderRadius: '24px',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className="template-preview-card"
      style={{
        ...getBackgroundStyle(),
        ...getBorderStyle(),
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header avec icône */}
      {design.icon !== 'none' && (
        <div
          style={{
            color: design.foregroundColor,
            marginBottom: '20px',
            opacity: 0.9,
          }}
        >
          {renderIcon()}
        </div>
      )}

      {/* Titre principal */}
      <h2
        style={{
          color: design.foregroundColor,
          fontSize: design.style === 'bold' ? '28px' : '24px',
          fontWeight: design.style === 'bold' ? 800 : 600,
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: design.style === 'bold' ? '2px' : '1px',
          textTransform: 'uppercase',
        }}
      >
        {design.text}
      </h2>

      {/* Sous-titre */}
      {design.subtext && (
        <p
          style={{
            color: design.foregroundColor,
            fontSize: '14px',
            fontWeight: 500,
            opacity: 0.8,
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          {design.subtext}
        </p>
      )}

      {/* QR Code */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          marginBottom: '20px',
        }}
      >
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={`QR Code ${tableNumber ? `Table ${tableNumber}` : ''}`}
            style={{
              width: '200px',
              height: '200px',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '200px',
              height: '200px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#999',
            }}
          >
            QR
          </div>
        )}
      </div>

      {/* Footer avec infos */}
      <div
        style={{
          textAlign: 'center',
          color: design.foregroundColor,
          opacity: 0.9,
        }}
      >
        <p
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          {restaurantName}
        </p>
        {tableNumber && (
          <p
            style={{
              fontSize: '14px',
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Table {tableNumber}
          </p>
        )}
      </div>

      {/* Accent décoratif pour certains styles */}
      {design.style === 'decorative' && design.accentColor && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: design.accentColor,
              opacity: 0.2,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: design.accentColor,
              opacity: 0.2,
            }}
          />
        </>
      )}
    </div>
  );
};

export default TemplatePreview;
