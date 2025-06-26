
import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';

function App() {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/features.json')
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch((err) => console.error('Error loading features:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>SAMI AI - Feature Dashboard</h1>

      {/* ✅ File Upload + GPT Analysis */}
      {features.fileUploadAndAnalysis && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>📁 File Upload + Analysis</h3>
          <FileUpload onProcess={(data) => setResult(data)} />
        </div>
      )}

      {/* ✅ Export Options Placeholder */}
      {features.exportOptions && (
        <div id="export-buttons" style={{ marginBottom: '1.5rem' }}>
          <h3>📄 Export Options</h3>
          <button>Export as PDF</button>{' '}
          <button>Export as CSV</button>
        </div>
      )}

      {/* ✅ Web Scraping Assistant Placeholder */}
      {features.webScrapingAssistant && (
        <div id="scraper" style={{ marginBottom: '1.5rem' }}>
          <h3>🌐 Web Scraping Assistant</h3>
          <p>Enter a URL to summarize and analyze with GPT.</p>
          {/* Scraper logic will go here later */}
        </div>
      )}

      {/* ✅ Analysis Results */}
      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>🧠 Resultado del Análisis:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* ✅ Debug Info */}
      <details style={{ marginTop: '2rem' }}>
        <summary>🛠 Feature Flags (Debug)</summary>
        <pre>{JSON.stringify(features, null, 2)}</pre>
      </details>
    </div>
  );
}

export default App;
