import React from 'react';
import { getTranslation, Lang } from '../i18n/i18n';

interface TypingIndicatorProps {
  lang: Lang;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ lang }) => {
  return (
    <div className="typing-indicator">
      <span>{getTranslation(lang, 'loading')}</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </div>
  );
};

export default TypingIndicator;
