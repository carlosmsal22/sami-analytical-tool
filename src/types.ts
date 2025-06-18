// ======================
// File Upload Types
// ======================
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  bytes: number;
  url?: string; // For local previews
  lastModified?: number; // Unix timestamp
}

export interface FileUploadResponse {
  id: string;
  name: string;
  type: string;
  bytes: number;
  purpose: 'assistants' | 'fine-tune'; // OpenAI purposes
  status?: 'uploaded' | 'processed' | 'error';
}

export interface FileUploadError {
  error: string;
  details?: unknown;
  statusCode?: number;
  supportedTypes?: string[]; // For 415 errors
}

export type FileUploadProgress = {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
};

// ======================
// Chat Message Types
// ======================
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  files?: UploadedFile[];
  status?: 'sending' | 'sent' | 'failed';
}

export interface StreamedMessage {
  content: string;
  isComplete: boolean;
  timestamp: Date;
}

// ======================
// Component Prop Types
// ======================
export interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  streamedContent?: string;
  onNewMessage: (message: Message) => void;
  onRetryMessage?: (messageId: string) => void;
  className?: string;
}

export interface ChatInputProps {
  onSend: (text: string, files?: string[]) => Promise<void>;
  onFileUpload?: (file: File) => Promise<FileUploadResponse>;
  disabled?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string;
  className?: string;
}

export interface TypingIndicatorProps {
  dotColor?: string;
  dotSize?: number;
  animationDuration?: number;
  className?: string;
}

// ======================
// API Response Types
// ======================
export interface StreamingResponse {
  status: 'streaming' | 'complete' | 'error';
  content: string;
  timestamp?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  statusCode?: number;
}

export interface SuccessResponse<T = unknown> {
  data: T;
  success: true;
  timestamp: number;
}

// ======================
// OpenAI Specific Types
// ======================
export interface OpenAIFile {
  id: string;
  bytes: number;
  filename: string;
  purpose: string;
  status: string;
  created_at: number;
}

export interface Assistant {
  id: string;
  name?: string;
  model: string;
  file_ids?: string[];
}

// ======================
// Event Types
// ======================
export interface FileUploadEvent {
  file: File;
  progress: number;
  status: 'started' | 'uploading' | 'completed' | 'error';
  response?: FileUploadResponse;
  error?: Error;
}

export interface ChatEvent {
  type: 'message' | 'typing' | 'error';
  data: Message | StreamedMessage | ErrorResponse;
}

// ======================
// Utility Types
// ======================
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys] & Omit<T, Keys>;