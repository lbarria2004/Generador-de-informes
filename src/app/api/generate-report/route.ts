import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateRecommendation, verifyReport } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, instructions } = body;

    if (!context) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó contexto para generar el informe' },
        { status: 400 }
      );
    }

    // Generate the main report (Sections 1-5)
    const report = await generateReport(context);

    // Verify the report consistency
    const verification = await verifyReport(context, report);

    // If instructions provided, also generate recommendation (Section 6)
    let fullReport = report;
    if (instructions && instructions.trim().length > 0) {
      const recommendation = await generateRecommendation(report, instructions);
      fullReport = `${report}\n\n${recommendation}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        report: fullReport,
        analysisOnly: report,
        verification
      }
    });
  } catch (error) {
    console.error('Error in generate-report API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al generar el informe' 
      },
      { status: 500 }
    );
  }
}
