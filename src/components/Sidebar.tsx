import React from 'react';
import { getTranslation, Lang } from '../i18n/i18n';

const Sidebar: React.FC<{ lang: Lang }> = ({ lang }) => {
  return (
    <div className="sidebar">
      <div className="exec-summary">
        <h3>{lang === 'en' ? 'Executive Summary' : 'Resumen Ejecutivo'}</h3>
        <p>{lang === 'en' ? 'Key insights and analytics...' : 'Principales insights y análisis...'}</p>
      </div>
      <div className="chart-thumbnails">
        <h3>{lang === 'en' ? 'Charts' : 'Gráficos'}</h3>
        <div className="thumbnail">{lang === 'en' ? 'Chart 1' : 'Gráfico 1'}</div>
        <div className="thumbnail">{lang === 'en' ? 'Chart 2' : 'Gráfico 2'}</div>
      </div>
    </div>
  );
};

export default Sidebar;
