import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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

    // Initialize AI client
    const zai = await ZAI.create();
    const results: string[] = [];

    for (const doc of documents) {
      try {
        const isPDF = doc.base64.includes('JVBERi0') || doc.name.toLowerCase().endsWith('.pdf');
        
        if (isPDF) {
          // Use VLM for PDF analysis
          const result = await analyzePDFWithVLM(zai, doc.base64, doc.name);
          results.push(result);
        } else {
          // For other documents, use LLM directly
          const completion = await zai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'Eres un asistente especializado en extraer información de documentos previsionales chilenos.'
              },
              {
                role: 'user',
                content: `Analiza el siguiente documento y extrae toda la información relevante:\n\n${doc.base64}`
              }
            ],
            temperature: 0.1
          });
          results.push(`=== DOCUMENTO: ${doc.name} ===\n${completion.choices[0]?.message?.content || ''}`);
        }
      } catch (docError) {
        console.error(`Error analyzing document ${doc.name}:`, docError);
        results.push(`=== ERROR EN DOCUMENTO: ${doc.name} ===\nNo se pudo analizar el documento. Error: ${docError instanceof Error ? docError.message : 'Error desconocido'}`);
      }
    }

    const context = results.join('\n\n');

    return NextResponse.json({
      success: true,
      data: {
        context: context
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

// Analyze PDF using VLM (Vision Language Model)
async function analyzePDFWithVLM(zai: Awaited<ReturnType<typeof ZAI.create>>, base64: string, name: string): Promise<string> {
  try {
    // Use VLM to analyze the PDF document
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un experto en análisis de documentos previsionales chilenos. Tu tarea es extraer TODA la información visible en el documento, incluyendo:
- Datos del afiliado (nombre, RUT, fecha de nacimiento, sexo, estado civil)
- Información de AFP y fondos
- Montos en UF y pesos
- Tablas de resultados SCOMP
- Ofertas de renta vitalicia
- Beneficiarios
- Fechas y números de documento

Transcribe TODOS los datos numéricos y textuales con precisión. Mantén el formato de tablas cuando sea relevante.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`
              }
            },
            {
              type: 'text',
              text: `Analiza este documento previsional (${name}) y extrae TODA la información visible. Incluye todos los montos, fechas, nombres, RUTs, y datos de tablas.`
            }
          ]
        }
      ],
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return `=== DOCUMENTO: ${name} ===\n[No se pudo extraer información del documento]`;
    }

    return `=== DOCUMENTO: ${name} ===\n${content}`;
  } catch (error) {
    console.error('VLM analysis error:', error);
    
    // Fallback: try with regular LLM describing the error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return `=== DOCUMENTO: ${name} ===\n[Error al analizar con VLM: ${errorMessage}]\n[Intenta cargar el documento nuevamente o verifica que sea un PDF válido]`;
  }
}
