import { NextRequest, NextResponse } from 'next/server';
import { GeminiService, getMimeType } from '@/lib/gemini-service';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Google Gemini es requerida' },
        { status: 400 }
      );
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron documentos para analizar' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);
    const results: string[] = [];

    // Process each document with Gemini Vision
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      console.log(`Analyzing document ${i + 1}/${documents.length}: ${doc.name}`);

      try {
        const mimeType = doc.type || getMimeType(doc.name);
        
        // Use Gemini Vision to analyze the document (OCR)
        const result = await geminiService.analyzeDocumentWithVision(
          doc.base64,
          mimeType,
          doc.name
        );
        results.push(result);
      } catch (docError) {
        console.error(`Error analyzing document ${doc.name}:`, docError);
        results.push(`=== ERROR EN DOCUMENTO: ${doc.name} ===\n${docError instanceof Error ? docError.message : 'Error desconocido'}`);
      }
    }

    const context = results.join('\n\n---\n\n');

    return NextResponse.json({
      success: true,
      data: {
        context: context,
        documentsProcessed: documents.length
      }
    });
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
