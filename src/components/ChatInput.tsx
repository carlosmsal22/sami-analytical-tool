import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { getTranslation, Lang } from '../i18n/i18n';

interface ChatInputProps {
  onSend: (text: string, files?: string[]) => void;
  disabled?: boolean;
  lang: Lang;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, lang }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadError(null);
      setUploadProgress(0);

      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      setUploadProgress(100);
      return await response.json();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    } finally {
      setTimeout(() => setUploadProgress(null), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    try {
      const uploadedIds = await Promise.all(files.map(file => uploadFile(file)));
      onSend(text, uploadedIds.map(f => f.id));
      setText('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div 
      className={`chat-input-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="upload-status">
        {uploadError && <div className="error-message">{uploadError}</div>}
        {uploadProgress !== null && (
          <div className="progress-bar">
            <div style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="file-previews">
          {files.map((file, index) => (
            <div key={index} className="file-preview">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-group">
          <button
            type="button"
            className="file-upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title={getTranslation(lang, 'uploadFile')}
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getTranslation(lang, 'typeMessage')}
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || (!text.trim() && files.length === 0)}
            className="send-button"
            title={getTranslation(lang, 'send')}
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
