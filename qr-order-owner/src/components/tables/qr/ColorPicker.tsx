import React from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#000000', '#FFFFFF', '#FF6B35', '#F7931E', '#FDC830',
  '#4ECDC4', '#45B7D1', '#5F27CD', '#EE5A6F', '#C44569',
];

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="color-picker-container">
      <label className="color-picker-label">
        <Palette className="w-4 h-4" />
        {label}
      </label>
      
      <div className="color-picker-inputs">
        {/* Sélecteur de couleur natif */}
        <div className="color-picker-swatch">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker-input"
          />
        </div>

        {/* Input texte */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="color-picker-text"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Couleurs prédéfinies */}
      <div className="color-picker-presets">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => onChange(presetColor)}
            className={`color-preset-btn ${
              color.toUpperCase() === presetColor.toUpperCase() ? 'active' : ''
            }`}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
