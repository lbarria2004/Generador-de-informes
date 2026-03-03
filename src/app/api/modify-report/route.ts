import { NextRequest, NextResponse } from 'next/server';
import { modifyReport } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, instructions } = body;

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó informe para modificar' },
        { status: 400 }
      );
    }

    if (!instructions || instructions.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron instrucciones de modificación' },
        { status: 400 }
      );
    }

    // Modify the report using AI
    const modifiedReport = await modifyReport(report, instructions);

    return NextResponse.json({
      success: true,
      data: {
        report: modifiedReport
      }
    });
  } catch (error) {
    console.error('Error in modify-report API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al modificar el informe' 
      },
      { status: 500 }
    );
  }
}
