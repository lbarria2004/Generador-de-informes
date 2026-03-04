import { NextRequest, NextResponse } from 'next/server';
import { GeminiService, PROMPTS } from '@/lib/gemini-service';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, instructions, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Google Gemini es requerida' },
        { status: 400 }
      );
    }

    if (!report || !instructions) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el informe y las instrucciones de modificación' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);
    const modifiedReport = await geminiService.modifyReport(report, instructions);

    return NextResponse.json({
      success: true,
      data: {
        report: modifiedReport
      }
    });
  } catch (error) {
    console.error('Error in modify-report API:', error);
    
    let errorMessage = 'Error al modificar el informe';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API Key inválida. Verifica tu clave de Google Gemini.';
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
