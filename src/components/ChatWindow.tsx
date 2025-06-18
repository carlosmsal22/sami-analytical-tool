// ... [unchanged imports]
import TypingIndicator from './TypingIndicator'; // ✅ Keep as-is
import { Message, FileUploadResponse } from '../types';
import { getTranslation, Lang } from '../i18n/i18n'; // ✅ Already imported

// ... [unchanged ChatWindowProps definition]

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading = false,
  isStreaming = false,
  streamedContent = '',
  onNewMessage,
  onFileUpload,
  className = '',
  lang // ✅ Already part of props
}) => {
  // ... [unchanged hooks, utils, renderFilePreview, markdownComponents, etc.]

  const renderSenderName = (sender: string) => {
    if (sender === 'user') {
      return lang === 'en' ? 'You' : 'Tú';
    } else {
      return lang === 'en' ? 'Assistant' : 'Asistente';
    }
  };

  return (
    <div className={`chat-window ${className}`}>
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender} ${msg.id === lastMessageId ? 'last-message' : ''}`}
            data-message-id={msg.id}
          >
            <div className="message-header">
              <span className="message-sender">
                {renderSenderName(msg.sender)}
              </span>
              <span className="message-timestamp">
                {formatTime(msg.timestamp)}
              </span>
            </div>

            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {msg.text}
              </ReactMarkdown>

              {msg.files && msg.files.length > 0 && (
                <div className="message-files">
                  {msg.files.map((file) => (
                    <div key={file.id}>{renderFilePreview(file)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="message bot streaming-message">
            <div className="message-header">
              <span className="message-sender">{renderSenderName('assistant')}</span>
            </div>
            <div className="message-content">
              {streamedContent ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {streamedContent}
                </ReactMarkdown>
              ) : (
                <TypingIndicator lang={lang} /> {/* ✅ UPDATED */}
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div className="message bot">
            <div className="message-header">
              <span className="message-sender">{renderSenderName('assistant')}</span>
            </div>
            <div className="message-content">
              <TypingIndicator lang={lang} /> {/* ✅ UPDATED */}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>
    </div>
  );
};

export default React.memo(ChatWindow);
