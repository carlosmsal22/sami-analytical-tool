// src/App.jsx
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

      {features.fileUploadAndAnalysis && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>📁 File Upload + Analysis</h3>
          <FileUpload onProcess={(data) => setResult(data)} />
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>🧠 Resultado del Análisis:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
