// src/i18n/i18n.ts

export const translations = {
  en: {
    uploadFile: "Upload file",
    runAnalysis: "Run analysis",
    summary: "Summary",
    dropHere: "Drop file here or click to upload",
    loading: "Processing...",
    send: "Send",
    language: "Language",
    typeMessage: "Type a message...",
    fileUploaded: "File uploaded successfully",
    selectLanguage: "Select language",
    darkMode: "Dark mode",
    lightMode: "Light mode"
  },
  es: {
    uploadFile: "Subir archivo",
    runAnalysis: "Ejecutar análisis",
    summary: "Resumen",
    dropHere: "Suelta el archivo aquí o haz clic para subir",
    loading: "Procesando...",
    send: "Enviar",
    language: "Idioma",
    typeMessage: "Escribe un mensaje...",
    fileUploaded: "Archivo subido con éxito",
    selectLanguage: "Seleccionar idioma",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro"
  }
};

export type Lang = keyof typeof translations;

export const getTranslation = (lang: Lang, key: keyof typeof translations["en"]) => {
  return translations[lang][key] || key;
};
