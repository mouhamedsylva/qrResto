import React from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  format: string;
}

interface TemplateCardProps {
  template: Template;
  onGenerate: (templateId: string) => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onGenerate,
  isGenerating = false,
  disabled = false
}) => {
  return (
    <div className={`template-card ${disabled ? 'template-card-disabled' : ''}`}>
      {/* Preview */}
      <div className="template-card-preview">
        <div className="template-card-preview-inner">
          <FileText className="template-card-preview-icon" />
        </div>
      </div>

      {/* Informations */}
      <div className="template-card-content">
        <h3 className="template-card-title">{template.name}</h3>
        <p className="template-card-description">{template.description}</p>
        
        <div className="template-card-footer">
          <span className="template-card-format">
            {template.format}
          </span>
          <button
            onClick={() => onGenerate(template.id)}
            disabled={disabled}
            className={`template-card-btn ${isGenerating ? 'template-card-btn-generating' : ''}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 template-card-btn-spinner" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Générer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
