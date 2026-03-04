import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, instructions, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Google Gemini es requerida' },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó contexto para generar el informe' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);

    // Generate the main report (Sections 1-5)
    const report = await geminiService.generateReport(context);

    // If instructions provided, also generate recommendation (Section 6)
    let fullReport = report;
    if (instructions && instructions.trim().length > 0) {
      const recommendation = await geminiService.generateRecommendation(report, instructions);
      fullReport = `${report}\n\n${recommendation}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        report: fullReport,
        analysisOnly: report
      }
    });
  } catch (error) {
    console.error('Error in generate-report API:', error);
    
    let errorMessage = 'Error al generar el informe';
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
