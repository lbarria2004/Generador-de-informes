import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocuments } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron documentos para analizar' },
        { status: 400 }
      );
    }

    // Analyze documents using VLM
    const analysisResult = await analyzeDocuments(documents);

    return NextResponse.json({
      success: true,
      data: {
        context: analysisResult
      }
    });
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al analizar documentos' 
      },
      { status: 500 }
    );
  }
}
