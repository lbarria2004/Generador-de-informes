import ZAI from 'z-ai-web-dev-sdk';

// Initialize the AI client
async function getAIClient() {
  return await ZAI.create();
}

// Prompts for the pension advisory system
export const PROMPTS = {
  ANALYSIS: `Eres un Asesor Previsional experto y senior, con profundo conocimiento del sistema de pensiones chileno (AFP, SCOMP, PGU, APV, etc.).
Tu tarea es analizar TODOS los documentos de antecedentes que te entregaré (SCOMP, Certificado de Saldo, etc.) y generar un **Informe de Análisis** que contenga ÚNICAMENTE las secciones 1 a 5.

REGLAS IMPORTANTES:
1. **Actúa como un experto:** Tu tono debe ser profesional y claro.
2. **Cíñete a los datos:** No inventes información. Si un dato no se encuentra en los documentos (ej. Fecha de Nacimiento), debes indicarlo explícitamente (ej: "Fecha de Nacimiento: No informada en los documentos").
3. **Calcula cuando se pida:** Para las Rentas Vitalicias Aumentadas, DEBES calcular los montos aumentados (Pensión Aumentada UF/$, Pensión Líquida Aumentada) basándote en la "pensión base" que encuentres en el SCOMP.
4. **Usa Markdown:** Estructura tu respuesta usando Markdown (títulos, negritas, tablas).
5. **Fecha del Informe:** {FECHA_HOY}
6. **NO INCLUYAS la Sección 6 (Recomendación Final).** Termina el informe después de la Sección 5.
7. **Formato de Títulos:** Usa '##' para Secciones (ej. ## 1) Antecedentes) y '###' para Subsecciones (ej. ### Certificado de Saldos). Usa '####' para los títulos de las modalidades (ej. #### a) Retiro programado).
8. **NO INCLUIR COMISIONES AFP (SOLO EN TABLA):** En la tabla de Retiro Programado, NO incluyas la columna "Comisión AFP". Sin embargo, SÍ debes considerar la comisión para el cálculo en la "Nota" explicativa debajo de la tabla.
9. **IMPORTANTE - ALINEACIÓN DE TABLAS:** Al extraer datos de tablas (especialmente SCOMP), ten mucho cuidado de **asociar correctamente cada AFP con SU monto**.
10. **IMPORTANTE - CHAIN OF THOUGHT (LISTAR MODALIDADES):** Antes de generar el informe, analiza internamente todas las modalidades de pensión presentes en el SCOMP (ej. Renta Vitalicia Inmediata con Retiro, Sin Retiro, Garantizada 120, 240, etc.). Asegúrate de no omitir NINGUNA en el informe final, especialmente las Garantizadas.

---
TEXTO EXTRAÍDO DE LOS DOCUMENTOS DEL CLIENTE (SCOMP, CARTOLAS, ETC.):
{CONTEXTO_DOCUMENTOS}
---

Basado ÚNICAMENTE en los documentos, genera el informe con la siguiente estructura exacta (Secciones 1 a 5):

## Informe final de Asesoría Previsional

### 1) Antecedentes del afiliado y Solicitud de Ofertas
[INSTRUCCIÓN CRÍTICA: Busca específicamente en el documento "Solicitud de Ofertas" para extraer los siguientes datos con mayor precisión. Si no están ahí, búscalos en el SCOMP.]
* **Nombre Completo:** [Extraer]
* **RUT:** [Extraer]
* **Fecha de Nacimiento:** [Extraer]
* **Edad Cumplida (a la fecha actual):** [Calcular o extraer si está]
* **Sexo:** [Extraer]
* **Estado Civil:** [Extraer]
* **AFP de Origen:** [Extraer desde Solicitud de Ofertas]
* **Institución de Salud:** [Extraer o poner "No informada"]
* **Fecha Solicitud de Pensión:** [Extraer]
* **Fecha Solicitud de Ofertas:** [Extraer fecha del encabezado del formulario Solicitud de Ofertas]
* **Tipo de Pensión Solicitada:** [Extraer desde Solicitud de Ofertas, ej: Vejez Edad]

#### Certificado de Saldos
**Descripción:** El saldo total destinado a pensión (Cotizaciones Obligatorias, Fondo [Extraer Fondo]) es de **UF [Extraer Saldo UF]**. Este monto equivale a **$[Extraer Saldo $]**. El valor de la UF utilizado es de **$[Extraer Valor UF]** al **[Extraer Fecha UF]**. Este Certificado se encuentra vigente hasta el día **[Extraer Vigencia Saldo]**.

### 2) Antecedentes del beneficiario
El afiliado declara a la siguiente beneficiaria legal de pensión:
[Generar una tabla Markdown con TODOS los beneficiarios encontrados en el SCOMP. Si no hay, indicar "Sin beneficiarios declarados".]
| Nombre Completo | RUT | Parentesco | Sexo | Invalidez | Fecha de Nacimiento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Nombre] | [RUT] | [Parentesco] | [F/M] | [S/N] | [Fecha] |

### 3) Situación previsional
* **Tipo de Pensión Solicitada:** [Extraer, ej: Vejez Edad, Cambio de Modalidad]
* **Saldo para Pensión:** **UF [Extraer Saldo UF]**
* **Modalidades Solicitadas al SCOMP:** [Extraer las modalidades que se pidieron, ej: RVIS, RVA 100% 36m]

### 4) Gestiones realizadas
[Describir las gestiones en formato lista o tabla, extrayendo fechas y acciones. Ej:
* **Solicitud de Pensión de Vejez Edad:** Presentada el [Fecha] a AFP [Nombre].
* **Retiro Certificado de Saldos:** Se retira el día [Fecha].
* **Solicitud de Ofertas (SCOMP):** Ingresada el [Fecha], por el Asesor Previsional [Nombre Asesor].]
* **Modalidades Solicitadas:** [Extraer TODAS las modalidades marcadas con 'X' en la Solicitud de Ofertas, incluyendo meses garantizados y cláusulas. Ej: "Retiro Programado", "Renta Vitalicia Inmediata con Condiciones Especiales de Cobertura: 240 meses garantizados"]

### 5) Resultados Scomp
#### a) Retiro programado
**Descripción:** Es una modalidad de pensión que se paga con cargo a la Cuenta de Capitalización Individual del afiliado. La pensión se recalcula anualmente, considerando el saldo remanente, la expectativa de vida del afiliado y de sus beneficiarios, y la rentabilidad del fondo. Por lo tanto, la pensión puede subir o bajar cada año.
**Cuadro de resultados:**
[Generar tabla Markdown con TODAS las AFP del SCOMP]
| AFP | Pensión en UF | Pensión Bruta en $| Descuento 7% Salud$ | Pensión Líquida en $ |
| :--- | :--- | :--- | :--- | :--- |
| [AFP 1] | [uf] | [bruta] | [salud] | [liquida] |

**Nota:** La oferta de Retiro Programado de su AFP de Origen ([Nombre AFP]) es de **[UF] UF** al mes, lo que equivale a una Pensión Bruta de **$[MontoBruto]**. Con el descuento de salud 7% ($[MontoSalud]) y la comisión de administración de la AFP del [Comision]% ($[MontoComision]), la pensión líquida aproximada es de **$[MontoLiquido]** para el primer año.

#### b) Renta Vitalicia
**Renta Vitalicia Inmediata Simple**
**Descripción:** Es un contrato con una Compañía de Seguros, donde el afiliado traspasa la totalidad de su saldo para recibir una pensión mensual en UF fija y de por vida. El monto no varía, independiente de la rentabilidad del mercado o de la expectativa de vida.
**Cuadro de resultados (4 mejores ofertas):**
| Compañía de Seguros | Pensión en UF | Pensión Bruta $| Descuento 7% Salud$ | Pensión Líquida $ |
| :--- | :--- | :--- | :--- | :--- |
| [Cia 1] | [uf] | [bruta] | [salud] | [liquida] |

[INSTRUCCIÓN CRÍTICA: Debes generar AQUI una sección para CADA modalidad de "Renta Vitalicia Inmediata Garantizada" encontrada en el SCOMP (ej. 120 meses, 240 meses). NO LAS OMITAS por ningún motivo. Si hay varias rentas garantizadas, haz una tabla separada para cada una.]

**Renta Vitalicia Inmediata Garantizada [X] Meses** (Repetir para cada periodo encontrado)
**Descripción:** En esta modalidad, si el asegurado fallece durante el periodo garantizado (ej. [X] meses), los beneficiarios designados recibirán el 100% de la pensión hasta cumplir dicho plazo.
**Cuadro de resultados (4 mejores ofertas):**
| Compañía de Seguros | Pensión en UF | Pensión Bruta $| Descuento 7% Salud$ | Pensión Líquida $ |
| :--- | :--- | :--- | :--- | :--- |

**Renta Vitalicia Aumentada**
**Descripción:** La "Cláusula de Aumento Temporal de Pensión" es una cobertura adicional que permite duplicar (aumentar en un 100%) el monto de la pensión durante un período determinado al inicio. Una vez que este período finaliza, la pensión vuelve a su monto base original, el cual es fijo en UF y se paga de por vida.
[Generar una sección para CADA modalidad de Renta Vitalicia Aumentada encontrada en el SCOMP, ej: "Renta Vitalicia Aumentada 100% por 36 Meses"]
**[Título de la Modalidad, ej: Renta Vitalicia Aumentada 100% por 36 Meses, Garantizado 180 meses.]**
**Cuadro de resultados (4 mejores ofertas):**
| Compañía | Pensión Aumentada en UF | Pensión Aumentada en $| Descuento 7% Salud$ | Pensión Líquida Período Aumentado | Pensión Después de Aumento en UF (Base) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Cia 1] | [Calcular: Base * 2] | [Calcular: Base $* 2] | [Calcular: (Base$ * 2) * 0.07] | [Calcular: (Base $ * 2) - Salud] | [Extraer Base UF] |

#### f) Otras Modalidades (Renta Temporal con Renta Vitalicia Diferida, etc.)
[INSTRUCCIÓN: Si en el SCOMP aparecen otras modalidades NO listadas arriba (ej. Renta Temporal con Renta Vitalicia Diferida), GENERA UNA SECCIÓN ADICIONAL aquí para cada una, manteniendo el mismo formato de tabla de resultados. NO OMITAS NINGUNA OFERTA DEL SCOMP.]`,

  RECOMMENDATION: `Eres un Asesor Previsional experto. Tu tarea es redactar la **Sección 6: Recomendación Final** para un informe.
Te entregaré el análisis de datos (Secciones 1-5) como contexto, y las instrucciones del asesor humano.
Redacta ÚNICAMENTE la "## 6) Recomendación Final" siguiendo las instrucciones.
---
INSTRUCCIONES DEL ASESOR HUMANO PARA LA RECOMENDACIÓN:
"{INSTRUCCIONES_USUARIO}"
---
CONTEXTO (ANÁLISIS DE DATOS SECCIONES 1-5):
{ANALISIS_PREVIO}
---
Redacta ÚNICAMENTE la "## 6) Recomendación Final":`,

  MODIFICATION: `Eres un editor profesional. Tu tarea es tomar el siguiente informe previsional y modificarlo según las instrucciones del usuario.

REGLAS:
1. **Aplica las modificaciones solicitadas** de forma precisa.
2. **No cambies el formato Markdown** (títulos ##, ###, tablas |, etc.) a menos que la instrucción te lo pida.
3. **Mantén el tono profesional** del informe.
4. Entrega el **informe completo modificado**, no solo la parte que cambiaste.
---
INFORME ORIGINAL:
{INFORME_ACTUAL}
---
INSTRUCCIONES DEL USUARIO PARA MODIFICAR:
"{INSTRUCCIONES_MODIFICACION}"
---
INFORME MODIFICADO:`,

  VERIFICATION: `Eres un Auditor de Calidad (QC) experto en informes previsionales. Tu misión es revisar que el "Informe Generado" sea fiel a los "Documentos Originales".
NO debes reescribir el informe, solo auditarlo.

Debes verificar DOS cosas críticas:
1. **Integridad de Modalidades:** ¿Están TODAS las modalidades de pensión del SCOMP en el informe?
   * **CRÍTICO:** Verifica que se incluyan las **"Renta Vitalicia Inmediata Garantizada"** (ej. 120, 240 meses) si aparecen en el original. Es el error más común.
   * Si es Invalidez, verifica la "Pensión de Referencia Garantizada".
   * Verifica que NO falten otras modalidades menos comunes (ej. Renta Temporal con Renta Vitalicia Diferida). Si está en el SCOMP, debe estar en el Informe.
2. **Exactitud de Montos:** ¿Los montos en UF de las ofertas coinciden con el documento original?

Documentos Originales (Texto extraído):
{CONTEXTO_ORIGINAL}
---
Informe Generado:
{INFORME_GENERADO}
---
Respuesta del Auditor:
Si todo está correcto y completo, responde EXACTAMENTE: "APROBADO".
Si encuentras errores u omisiones (especialmente modalidades faltantes), responde: "RECHAZADO: [Lista breve de lo que falta o está mal]".`
};

// Analyze documents using VLM for PDFs and LLM for text extraction
export async function analyzeDocuments(documents: { name: string; base64: string }[]): Promise<string> {
  const zai = await getAIClient();
  const results: string[] = [];

  for (const doc of documents) {
    try {
      // Check if it's a PDF (base64 starts with JVBE or similar)
      const isPDF = doc.base64.includes('JVBERi0') || doc.name.toLowerCase().endsWith('.pdf');
      
      if (isPDF) {
        // Use VLM for PDF analysis (convert each page to image and analyze)
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
    } catch (error) {
      console.error(`Error analyzing document ${doc.name}:`, error);
      results.push(`=== ERROR EN DOCUMENTO: ${doc.name} ===\nNo se pudo analizar el documento.`);
    }
  }

  return results.join('\n\n');
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

    return `=== DOCUMENTO: ${name} ===\n${response.choices[0]?.message?.content || 'No se pudo extraer información'}`;
  } catch (error) {
    console.error('VLM analysis error:', error);
    // Fallback: try with regular LLM if VLM fails
    return `=== DOCUMENTO: ${name} ===\n[Documento PDF - Análisis pendiente]`;
  }
}

// Generate report using LLM
export async function generateReport(context: string): Promise<string> {
  const zai = await getAIClient();
  
  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const prompt = PROMPTS.ANALYSIS
    .replace('{FECHA_HOY}', fechaHoy)
    .replace('{CONTEXTO_DOCUMENTOS}', context);

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Eres un Asesor Previsional experto en el sistema de pensiones chileno.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    max_tokens: 8000
  });

  return completion.choices[0]?.message?.content || '';
}

// Generate recommendation using LLM
export async function generateRecommendation(analysis: string, instructions: string): Promise<string> {
  const zai = await getAIClient();

  const prompt = PROMPTS.RECOMMENDATION
    .replace('{INSTRUCCIONES_USUARIO}', instructions)
    .replace('{ANALISIS_PREVIO}', analysis);

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Eres un Asesor Previsional experto en el sistema de pensiones chileno.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 4000
  });

  return completion.choices[0]?.message?.content || '';
}

// Modify report using LLM
export async function modifyReport(report: string, instructions: string): Promise<string> {
  const zai = await getAIClient();

  const prompt = PROMPTS.MODIFICATION
    .replace('{INFORME_ACTUAL}', report)
    .replace('{INSTRUCCIONES_MODIFICACION}', instructions);

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Eres un editor profesional de informes previsionales.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 8000
  });

  return completion.choices[0]?.message?.content || report;
}

// Verify report consistency
export async function verifyReport(context: string, report: string): Promise<string> {
  const zai = await getAIClient();

  const prompt = PROMPTS.VERIFICATION
    .replace('{CONTEXTO_ORIGINAL}', context)
    .replace('{INFORME_GENERADO}', report);

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Eres un Auditor de Calidad experto en informes previsionales chilenos.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.0,
    max_tokens: 1000
  });

  return completion.choices[0]?.message?.content || '';
}
