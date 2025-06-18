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

      {/* Chat Workspace Layout */}
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar lang={lang} />
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow lang={lang} />
            <ChatInput lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;