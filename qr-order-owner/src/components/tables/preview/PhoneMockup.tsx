import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ children }) => {
  return (
    <div className="phone-mockup">
      {/* Cadre du téléphone */}
      <div className="phone-mockup-frame">
        {/* Encoche */}
        <div className="phone-mockup-notch" />
        
        {/* Écran */}
        <div className="phone-mockup-screen">
          {/* Barre de statut améliorée */}
          <div className="phone-mockup-statusbar">
            <span className="phone-mockup-time">9:41</span>
            <div className="phone-mockup-battery">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="phone-mockup-battery-icon">
                <div className="phone-mockup-battery-fill" />
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="phone-mockup-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
