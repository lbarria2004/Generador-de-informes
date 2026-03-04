import { NextRequest, NextResponse } from 'next/server';
import { GeminiService, getMimeType } from '@/lib/gemini-service';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Analyze a document that was already uploaded to Gemini File API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUri, mimeType, documentName, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Google Gemini es requerida' },
        { status: 400 }
      );
    }

    if (!fileUri) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó el URI del archivo' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);

    console.log(`Analyzing uploaded file: ${documentName}`);

    try {
      const detectedMimeType = mimeType || getMimeType(documentName || '');

      // Use Gemini to analyze the already-uploaded file
      const result = await geminiService.analyzeUploadedFile(
        fileUri,
        detectedMimeType,
        documentName || 'Documento'
      );

      return NextResponse.json({
        success: true,
        data: {
          context: result,
          documentName: documentName || 'Documento'
        }
      });
    } catch (docError) {
      console.error(`Error analyzing document:`, docError);
      return NextResponse.json({
        success: false,
        error: `Error al analizar: ${docError instanceof Error ? docError.message : 'Error desconocido'}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in analyze API:', error);

    let errorMessage = 'Error al analizar documentos';
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('api key')) {
        errorMessage = 'API Key inválida. Verifica tu clave de Google Gemini en: https://aistudio.google.com/app/apikey';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Se ha excedido la cuota de la API. Intenta más tarde.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
