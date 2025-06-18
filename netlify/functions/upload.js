import { Handler } from '@netlify/functions';
import { OpenAI } from 'openai';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { createHash } from 'crypto';

// Type definitions
interface UploadedFile {
  buffer: Buffer;
  name: string;
  type: string;
  size: number;
  hash: string;
}

interface UploadResponse {
  id: string;
  name: string;
  type: string;
  bytes: number;
  hash: string;
  purpose: string;
  status: 'uploaded' | 'processed';
  timestamp: string;
}

interface UploadError {
  error: string;
  code?: string;
  details?: unknown;
  supportedTypes?: string[];
  maxSize?: number;
}

// Configuration
const CONFIG = {
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_TYPES: [
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif'
  ],
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // 10 uploads per window
  }
};

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_KEY,
  timeout: 30000 // 30 second timeout
});

export const handler: Handler = async (event) => {
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Validate environment
  if (!process.env.OPENAI_KEY) {
    const error: UploadError = { 
      error: "Server configuration error",
      code: "CONFIG_MISSING",
      details: "OpenAI API key not configured"
    };
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(error)
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Allow': 'POST' },
      body: JSON.stringify({ 
        error: "Method Not Allowed",
        code: "METHOD_NOT_ALLOWED"
      })
    };
  }

  try {
    // Parse multipart form data
    const fileData = await parseFormData(event);
    
    // Validate file
    validateFile(fileData);

    // Upload to OpenAI
    const file = await uploadToOpenAI(fileData);

    // Prepare success response
    const response: UploadResponse = {
      id: file.id,
      name: fileData.name,
      type: fileData.type,
      bytes: fileData.size,
      hash: fileData.hash,
      purpose: "assistants",
      status: 'uploaded',
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Upload error:', error);
    return handleError(error);
  }
};

// Helper Functions
async function parseFormData(event: any): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ 
      headers: event.headers,
      limits: {
        fileSize: CONFIG.MAX_FILE_SIZE,
        files: 1 // Only allow single file uploads
      }
    });

    let fileBuffer = Buffer.alloc(0);
    let fileName = '';
    let fileType = '';
    let fileSize = 0;
    const hash = createHash('sha256');

    busboy.on('file', (fieldname, file, info) => {
      if (fieldname !== 'file') {
        return reject({
          statusCode: 400,
          error: "Invalid field name",
          code: "INVALID_FIELD",
          details: `Expected 'file' field, got '${fieldname}'`
        });
      }

      fileName = info.filename;
      fileType = info.mimeType;

      file.on('data', (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
        fileSize += data.length;
        hash.update(data);
      });

      file.on('limit', () => {
        reject({
          statusCode: 413,
          error: `File exceeds maximum size of ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
          code: "FILE_TOO_LARGE",
          maxSize: CONFIG.MAX_FILE_SIZE
        });
      });

      file.on('end', () => {
        if (!fileName || fileBuffer.length === 0) {
          return reject({
            statusCode: 400,
            error: "No file data received",
            code: "NO_FILE_DATA"
          });
        }
        resolve({
          buffer: fileBuffer,
          name: fileName,
          type: fileType,
          size: fileSize,
          hash: hash.digest('hex')
        });
      });
    });

    busboy.on('error', (err) => {
      console.error('Busboy error:', err);
      reject({
        statusCode: 400,
        error: "Failed to parse form data",
        code: "PARSE_ERROR",
        details: err.message
      });
    });

    busboy.on('partsLimit', () => {
      reject({
        statusCode: 413,
        error: "Too many parts in form data",
        code: "TOO_MANY_PARTS"
      });
    });

    busboy.end(Buffer.from(event.body || '', 'base64'));
  });
}

function validateFile(file: UploadedFile): void {
  // Validate file type
  if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
    throw {
      statusCode: 415,
      error: `Unsupported file type: ${file.type}`,
      code: "UNSUPPORTED_TYPE",
      supportedTypes: CONFIG.ALLOWED_TYPES
    };
  }

  // Validate file name
  if (!file.name || file.name.length > 255) {
    throw {
      statusCode: 400,
      error: "Invalid file name",
      code: "INVALID_FILENAME"
    };
  }

  // Validate file extension
  const validExtensions = ['.txt', '.csv', '.pdf', '.json', '.xlsx', '.png', '.jpg', '.jpeg', '.gif'];
  const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(fileExt)) {
    throw {
      statusCode: 400,
      error: `Unsupported file extension: ${fileExt}`,
      code: "UNSUPPORTED_EXTENSION",
      supportedExtensions: validExtensions
    };
  }

  // Validate file content (basic check for empty files)
  if (file.size === 0) {
    throw {
      statusCode: 400,
      error: "Empty file not allowed",
      code: "EMPTY_FILE"
    };
  }
}

async function uploadToOpenAI(file: UploadedFile) {
  try {
    const fileStream = Readable.from(file.buffer);
    return await openai.files.create({
      file: fileStream,
      purpose: "assistants",
      filename: file.name
    });
  } catch (error) {
    console.error('OpenAI upload error:', error);
    throw {
      statusCode: 502,
      error: "Failed to upload file to OpenAI",
      code: "OPENAI_UPLOAD_FAILED",
      details: error.message
    };
  }
}

function handleError(error: any): any {
  const statusCode = error.statusCode || 500;
  const response: UploadError = {
    error: error.error || error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR'
  };

  if (error.details) {
    response.details = error.details;
  }

  // Add helpful metadata for certain error types
  if (error.code === 'UNSUPPORTED_TYPE') {
    response.supportedTypes = CONFIG.ALLOWED_TYPES;
  }

  if (error.code === 'FILE_TOO_LARGE') {
    response.maxSize = CONFIG.MAX_FILE_SIZE;
  }

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(response)
  };
}