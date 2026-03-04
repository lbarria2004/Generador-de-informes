// PDF Processing Service
// Handles PDF extraction and OCR using Gemini Vision

import { GeminiService, getMimeType } from './gemini-service';

// PDF text extraction using pdf-parse (for digital PDFs)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse (ESM compatibility)
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer, {
      max: 0, // No page limit
      version: 'v1.10.100'
    });
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

// Check if PDF text is sufficient or needs OCR
function needsOCR(text: string): boolean {
  // If text is very short or mostly empty, we need OCR
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return cleanText.length < 100;
}

// Process a single document (PDF or image)
export async function processDocument(
  file: {
    name: string;
    base64: string;
    buffer?: Buffer;
  },
  geminiService: GeminiService
): Promise<string> {
  const mimeType = getMimeType(file.name);
  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  
  let result = '';
  
  if (isPDF) {
    // For PDFs, try text extraction first
    const buffer = file.buffer || Buffer.from(file.base64, 'base64');
    const text = await extractTextFromPDF(buffer);
    
    if (!needsOCR(text)) {
      // Digital PDF with extractable text
      result = `=== DOCUMENTO: ${file.name} (PDF Digital) ===\n${text}`;
    } else {
      // Scanned PDF - needs OCR via Gemini Vision
      console.log(`PDF ${file.name} requires OCR, using Gemini Vision...`);
      result = await geminiService.analyzeDocumentWithVision(
        file.base64,
        mimeType,
        file.name
      );
    }
  } else if (mimeType.startsWith('image/')) {
    // Image file - use Gemini Vision directly
    result = await geminiService.analyzeDocumentWithVision(
      file.base64,
      mimeType,
      file.name
    );
  } else {
    // Unknown file type
    result = `=== DOCUMENTO: ${file.name} ===\n[Tipo de archivo no soportado: ${mimeType}]`;
  }
  
  return result;
}

// Process multiple documents
export async function processDocuments(
  documents: Array<{
    name: string;
    base64: string;
    buffer?: Buffer;
  }>,
  apiKey: string
): Promise<string> {
  const geminiService = new GeminiService(apiKey);
  const results: string[] = [];
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    console.log(`Processing document ${i + 1}/${documents.length}: ${doc.name}`);
    
    try {
      const result = await processDocument(doc, geminiService);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${doc.name}:`, error);
      results.push(`=== ERROR EN DOCUMENTO: ${doc.name} ===\n${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
  
  return results.join('\n\n');
}

// Convert File to base64 (client-side helper)
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert File to Buffer (server-side helper)
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
