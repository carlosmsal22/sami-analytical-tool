import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import { getTranslation, translations, Lang } from './i18n/i18n';

const App = () => {
  const [lang, setLang] = useState<Lang>('es');

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'es' : 'en'));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header with Title and Language Toggle */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {lang === 'en' ? 'SAMI AI Advanced Tool' : 'Herramienta Avanzada SAMI AI'}
        </h1>
        <button
          onClick={toggleLang}
          className="bg-white text-gray-900 px-4 py-1 rounded hover:bg-gray-200 transition"
        >
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <main className="md:col-span-2 space-y-4">
          <ChatWindow lang={lang} />
          <ChatInput lang={lang} />
        </main>
        <aside>
          <Sidebar lang={lang} />
        </aside>
      </div>
    </div>
  );
};

export default App;
