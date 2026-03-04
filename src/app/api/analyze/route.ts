import { NextRequest, NextResponse } from 'next/server';
import { GeminiService, getMimeType } from '@/lib/gemini-service';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Single document analysis endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Google Gemini es requerida' },
        { status: 400 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó documento para analizar' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);

    console.log(`Analyzing document: ${document.name}`);

    try {
      const mimeType = document.type || getMimeType(document.name);

      // Use Gemini Vision to analyze the document (OCR)
      const result = await geminiService.analyzeDocumentWithVision(
        document.base64,
        mimeType,
        document.name
      );

      return NextResponse.json({
        success: true,
        data: {
          context: result,
          documentName: document.name
        }
      });
    } catch (docError) {
      console.error(`Error analyzing document ${document.name}:`, docError);
      return NextResponse.json({
        success: false,
        error: `Error en ${document.name}: ${docError instanceof Error ? docError.message : 'Error desconocido'}`
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
