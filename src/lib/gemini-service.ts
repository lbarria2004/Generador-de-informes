import { GoogleGenAI } from '@google/genai';

// Prompts for the pension advisory system
export const PROMPTS = {
  DOCUMENT_ANALYSIS: `Eres un experto en análisis de documentos previsionales chilenos. Tu tarea es extraer TODA la información del documento proporcionado.

INSTRUCCIONES CRÍTICAS:
1. Transcribe TODOS los datos con precisión EXACTA - especial atención a montos en UF y pesos
2. Si ves tablas SCOMP, transcribe TODAS las filas y columnas sin omitir ninguna
3. Extrae datos del afiliado: nombre, RUT, fecha nacimiento, sexo, estado civil, AFP
4. Extrae montos: saldos en UF, pensiones en UF y pesos, descuentos de salud
5. Identifica beneficiarios declarados
6. Indica claramente el tipo de documento (SCOMP, Certificado de Saldo, Solicitud, etc.)
7. Para tablas de resultados SCOMP: incluye TODAS las AFP y compañías de seguros con sus montos

DOCUMENTO A ANALIZAR: {DOCUMENT_NAME}`,

  REPORT_GENERATION: `Eres un Asesor Previsional experto y senior, con profundo conocimiento del sistema de pensiones chileno (AFP, SCOMP, PGU, APV, etc.).

Tu tarea es generar un **INFORME DE ASESORÍA PREVISIONAL** basado en los datos extraídos de los documentos.

REGLAS IMPORTANTES:
1. **Cíñete EXACTAMENTE a los datos extraídos** - No inventes ni infieras información
2. **Usa Markdown**: Estructura tu respuesta con títulos (##, ###), negritas (**texto**) y tablas (|)
3. **Fecha del Informe:** {FECHA_HOY}
4. **Transcribe montos exactos** - Si dice "15.456,78 UF", escribe exactamente eso
5. **Completa todas las secciones** - No dejes campos vacíos, usa "No informado" si falta el dato

ESTRUCTURA OBLIGATORIA DEL INFORME (Secciones 1 a 5):

## Informe final de Asesoría Previsional

### 1) Antecedentes del afiliado y Solicitud de Ofertas
* **Nombre Completo:** [datos]
* **RUT:** [datos]
* **Fecha de Nacimiento:** [datos]
* **Edad Cumplida:** [calcular si hay fecha nacimiento]
* **Sexo:** [datos]
* **Estado Civil:** [datos]
* **AFP de Origen:** [datos]
* **Institución de Salud:** [datos]
* **Fecha Solicitud de Pensión:** [datos]
* **Fecha Solicitud de Ofertas:** [datos]
* **Tipo de Pensión Solicitada:** [datos]

#### Certificado de Saldos
**Descripción:** El saldo total destinado a pensión (Cotizaciones Obligatorias, Fondo [X]) es de **UF [X]**. Este monto equivale a **$[X]**. El valor de la UF utilizado es de **$[X]** al **[fecha]**. Este Certificado se encuentra vigente hasta el día **[fecha]**.

### 2) Antecedentes del beneficiario
El afiliado declara a la siguiente beneficiaria legal de pensión:
| Nombre Completo | RUT | Parentesco | Sexo | Invalidez | Fecha de Nacimiento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [datos] | [datos] | [datos] | [datos] | [datos] | [datos] |

### 3) Situación previsional
* **Tipo de Pensión Solicitada:** [datos]
* **Saldo para Pensión:** **UF [X]**
* **Modalidades Solicitadas al SCOMP:** [listar todas las modalidades marcadas]

### 4) Gestiones realizadas
* **Solicitud de Pensión de [Tipo]:** Presentada el [fecha] a AFP [nombre].
* **Retiro Certificado de Saldos:** Se retira el día [fecha].
* **Solicitud de Ofertas (SCOMP):** Ingresada el [fecha].
* **Modalidades Solicitadas:** [listar todas las modalidades]

### 5) Resultados SCOMP
#### a) Retiro programado
**Descripción:** Es una modalidad de pensión que se paga con cargo a la Cuenta de Capitalización Individual del afiliado. La pensión se recalcula anualmente.

**Cuadro de resultados:**
| AFP | Pensión en UF | Pensión Bruta en $ | Descuento 7% Salud $ | Pensión Líquida en $ |
| :--- | :--- | :--- | :--- | :--- |
| [AFP 1] | [UF] | [monto] | [descuento] | [líquido] |
| [AFP 2] | [UF] | [monto] | [descuento] | [líquido] |
[... todas las AFP que aparezcan]

**Nota:** La oferta de Retiro Programado de su AFP de Origen ([nombre]) es de **[X] UF** al mes...

#### b) Renta Vitalicia
**Renta Vitalicia Inmediata Simple**
**Descripción:** Es un contrato con una Compañía de Seguros, donde el afiliado traspasa la totalidad de su saldo para recibir una pensión mensual en UF fija y de por vida.

| Compañía de Seguros | Pensión en UF | Pensión Bruta $ | Descuento 7% Salud $ | Pensión Líquida $ |
| :--- | :--- | :--- | :--- | :--- |
| [Cia 1] | [UF] | [monto] | [descuento] | [líquido] |
[... 4 mejores ofertas]

**Renta Vitalicia Inmediata Garantizada [X] Meses** (para cada periodo encontrado en el SCOMP)
[Tabla con ofertas]

**Renta Vitalicia Aumentada** (si aparece en el SCOMP)
[Tabla con ofertas]`,

  RECOMMENDATION: `Eres un Asesor Previsional experto. Tu tarea es redactar la **Sección 6: Recomendación Final** para un informe de asesoría previsional.

Te entregaré:
1. El análisis de datos (Secciones 1-5) como contexto
2. Las instrucciones específicas del asesor humano

INSTRUCCIONES DEL ASESOR HUMANO:
"{INSTRUCCIONES}"

CONTEXTO DEL ANÁLISIS (SECCIONES 1-5):
{ANALISIS}

Redacta ÚNICAMENTE la sección "## 6) Recomendación Final" siguiendo las instrucciones del asesor. La recomendación debe:
- Ser profesional y clara
- Basarse en los datos del análisis
- Seguir las instrucciones específicas del asesor
- Usar formato Markdown (puedes usar listas, negritas, etc.)`,

  MODIFICATION: `Eres un editor profesional de informes previsionales. Tu tarea es modificar el siguiente informe según las instrucciones del usuario.

REGLAS:
1. Aplica las modificaciones solicitadas de forma precisa
2. No cambies el formato Markdown (títulos ##, ###, tablas |) a menos que sea necesario
3. Mantén el tono profesional del informe
4. Entrega el informe COMPLETO modificado

INFORME ORIGINAL:
{INFORME}

INSTRUCCIONES DE MODIFICACIÓN:
"{INSTRUCCIONES}"

INFORME MODIFICADO:`
};

// Model names - using the latest available models
const MODEL_NAME = 'gemini-2.5-flash';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Analyze document using Gemini File API (for uploaded files)
   * Uses the file URI from Gemini's file upload
   */
  async analyzeUploadedFile(
    fileUri: string,
    mimeType: string,
    documentName: string
  ): Promise<string> {
    try {
      const prompt = PROMPTS.DOCUMENT_ANALYSIS.replace('{DOCUMENT_NAME}', documentName);

      // Use the correct structure for the new SDK
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                fileData: {
                  mimeType: mimeType,
                  fileUri: fileUri
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });

      const text = response.text;
      return `=== DOCUMENTO: ${documentName} ===\n${text}`;
    } catch (error) {
      console.error('Error in analyzeUploadedFile:', error);
      throw new Error(`Error al analizar documento ${documentName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Analyze document using inline data (for small files)
   */
  async analyzeDocumentWithVision(
    base64Data: string,
    mimeType: string,
    documentName: string
  ): Promise<string> {
    try {
      const prompt = PROMPTS.DOCUMENT_ANALYSIS.replace('{DOCUMENT_NAME}', documentName);

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });

      const text = response.text;
      return `=== DOCUMENTO: ${documentName} ===\n${text}`;
    } catch (error) {
      console.error('Error in analyzeDocumentWithVision:', error);
      throw new Error(`Error al analizar documento ${documentName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Generate full report from extracted context
   */
  async generateReport(context: string): Promise<string> {
    try {
      const fechaHoy = new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const prompt = PROMPTS.REPORT_GENERATION
        .replace('{FECHA_HOY}', fechaHoy) +
        '\n\n---\nDATOS EXTRAÍDOS DE LOS DOCUMENTOS:\n' + context + '\n---';

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });

      return response.text;
    } catch (error) {
      console.error('Error in generateReport:', error);
      throw new Error(`Error al generar informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Generate recommendation (Section 6) based on analysis and instructions
   */
  async generateRecommendation(analysis: string, instructions: string): Promise<string> {
    try {
      const prompt = PROMPTS.RECOMMENDATION
        .replace('{INSTRUCCIONES}', instructions)
        .replace('{ANALISIS}', analysis);

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });

      return response.text;
    } catch (error) {
      console.error('Error in generateRecommendation:', error);
      throw new Error(`Error al generar recomendación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Modify existing report based on instructions
   */
  async modifyReport(report: string, instructions: string): Promise<string> {
    try {
      const prompt = PROMPTS.MODIFICATION
        .replace('{INFORME}', report)
        .replace('{INSTRUCCIONES}', instructions);

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      });

      return response.text;
    } catch (error) {
      console.error('Error in modifyReport:', error);
      throw new Error(`Error al modificar informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Helper function to get MIME type from filename
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Validate API Key format
export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith('AIza') && apiKey.length > 30;
}
