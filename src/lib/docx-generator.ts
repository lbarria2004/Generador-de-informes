import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  VerticalAlign,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  LevelFormat,
} from 'docx';

// Color palette for the document
const COLORS = {
  primary: '1E3A5F',      // Dark blue for headings
  text: '000000',          // Black for body text
  tableHeader: 'E8EEF4',   // Light blue for table headers
  tableBorder: '4A6B8A',   // Medium blue for borders
  lightGray: 'F5F5F5',     // Light gray for alternating rows
};

// Table borders configuration
const tableBorder = { style: BorderStyle.SINGLE, size: 8, color: COLORS.tableBorder };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

interface AdvisorInfo {
  name: string;
  rut: string;
  registryNumber: string;
  entity: string;
  phone: string;
  email: string;
  address: string;
}

interface ReportData {
  // Section 1: Affiliate data
  nombreCompleto: string;
  rut: string;
  fechaNacimiento: string;
  edad: string;
  sexo: string;
  estadoCivil: string;
  afpOrigen: string;
  institucionSalud: string;
  fechaSolicitudPension: string;
  fechaSolicitudOfertas: string;
  tipoPension: string;
  
  // Certificate of balances
  saldoUF: string;
  saldoPesos: string;
  valorUF: string;
  fechaValorUF: string;
  vigenciaCertificado: string;
  
  // Section 2: Beneficiaries
  beneficiarios: Array<{
    nombre: string;
    rut: string;
    parentesco: string;
    sexo: string;
    invalidez: string;
    fechaNacimiento: string;
  }>;
  
  // Section 3: Pension situation
  modalidadesSolicitadas: string[];
  
  // Section 4: Management
  fechaCertificado: string;
  fechaScomp: string;
  consultaScomp: string;
  entidadAsesoria: string;
  
  // Section 5: SCOMP Results
  retiroProgramado: Array<{
    afp: string;
    pensionUF: string;
    pensionBruta: string;
    descuentoSalud: string;
    pensionLiquida: string;
  }>;
  
  rentasVitalicias: {
    simple: Array<{
      compania: string;
      pensionUF: string;
      pensionBruta: string;
      descuentoSalud: string;
      pensionLiquida: string;
    }>;
    garantizada120: Array<{
      compania: string;
      pensionUF: string;
      pensionBruta: string;
      descuentoSalud: string;
      pensionLiquida: string;
    }>;
    garantizada180: Array<{
      compania: string;
      pensionUF: string;
      pensionBruta: string;
      descuentoSalud: string;
      pensionLiquida: string;
    }>;
    garantizada240: Array<{
      compania: string;
      pensionUF: string;
      pensionBruta: string;
      descuentoSalud: string;
      pensionLiquida: string;
    }>;
  };
  
  // Section 6: Recommendation
  recomendacion: string;
  
  // Advisor info
  asesor: AdvisorInfo;
}

// Parse markdown report to extract data
function parseMarkdownReport(markdown: string, advisorInfo?: Partial<AdvisorInfo>): ReportData {
  const defaultAdvisor: AdvisorInfo = {
    name: advisorInfo?.name || '[Nombre del Asesor Previsional]',
    rut: advisorInfo?.rut || '[RUT]',
    registryNumber: advisorInfo?.registryNumber || '[N° Registro]',
    entity: advisorInfo?.entity || '[Entidad de Asesoría Previsional]',
    phone: advisorInfo?.phone || '[Teléfono]',
    email: advisorInfo?.email || '[Email]',
    address: advisorInfo?.address || '[Dirección]',
  };
  
  // Default empty data
  const defaultData: ReportData = {
    nombreCompleto: 'No informado',
    rut: 'No informado',
    fechaNacimiento: 'No informado',
    edad: 'No informado',
    sexo: 'No informado',
    estadoCivil: 'No informado',
    afpOrigen: 'No informado',
    institucionSalud: 'No informado',
    fechaSolicitudPension: 'No informado',
    fechaSolicitudOfertas: 'No informado',
    tipoPension: 'No informado',
    saldoUF: 'No informado',
    saldoPesos: 'No informado',
    valorUF: 'No informado',
    fechaValorUF: 'No informado',
    vigenciaCertificado: 'No informado',
    beneficiarios: [],
    modalidadesSolicitadas: [],
    fechaCertificado: 'No informado',
    fechaScomp: 'No informado',
    consultaScomp: 'No informado',
    entidadAsesoria: 'No informado',
    retiroProgramado: [],
    rentasVitalicias: { simple: [], garantizada120: [], garantizada180: [], garantizada240: [] },
    recomendacion: '',
    asesor: defaultAdvisor,
  };
  
  // Extract values using regex patterns
  const extractField = (pattern: RegExp): string => {
    const match = markdown.match(pattern);
    return match ? match[1].trim() : 'No informado';
  };
  
  // Section 1 fields
  defaultData.nombreCompleto = extractField(/\*\*Nombre Completo:\*\*\s*([^\n]+)/);
  defaultData.rut = extractField(/\*\*RUT:\*\*\s*([^\n]+)/);
  defaultData.fechaNacimiento = extractField(/\*\*Fecha de Nacimiento:\*\*\s*([^\n]+)/);
  defaultData.edad = extractField(/\*\*Edad Cumplida[^:]*:\*\*\s*([^\n]+)/);
  defaultData.sexo = extractField(/\*\*Sexo:\*\*\s*([^\n]+)/);
  defaultData.estadoCivil = extractField(/\*\*Estado Civil:\*\*\s*([^\n]+)/);
  defaultData.afpOrigen = extractField(/\*\*AFP de Origen:\*\*\s*([^\n]+)/);
  defaultData.institucionSalud = extractField(/\*\*Institución de Salud:\*\*\s*([^\n]+)/);
  defaultData.fechaSolicitudPension = extractField(/\*\*Fecha Solicitud de Pensión:\*\*\s*([^\n]+)/);
  defaultData.fechaSolicitudOfertas = extractField(/\*\*Fecha Solicitud de Ofertas:\*\*\s*([^\n]+)/);
  defaultData.tipoPension = extractField(/\*\*Tipo de Pensión Solicitada:\*\*\s*([^\n]+)/);
  
  // Certificate data
  defaultData.saldoUF = extractField(/UF\s*([\d.,]+)/);
  defaultData.saldoPesos = extractField(/\$([\d.]+)/);
  
  // Section 3
  defaultData.modalidadesSolicitadas = extractField(/\*\*Modalidades Solicitadas[^:]*:\*\*\s*([^\n]+)/).split(',').map(s => s.trim());
  
  // Section 4
  defaultData.fechaCertificado = extractField(/Certificado de Saldos[^:]*:\s*Emitido con fecha\s*([^.]+)/);
  defaultData.fechaScomp = extractField(/Solicitud de Ofertas \(SCOMP\)[^:]*:\s*Certificado emitido el\s*([\d/]+)/);
  defaultData.consultaScomp = extractField(/Consulta\s*(\d+)/);
  defaultData.entidadAsesoria = extractField(/gestionado por la Entidad de Asesoría Previsional\s*([^.]+)/);
  
  // Extract recommendation (Section 6)
  const recMatch = markdown.match(/## 6\) Recomendación Final([\s\S]*?)(?=$|##)/);
  if (recMatch) {
    defaultData.recomendacion = recMatch[1].trim();
  }
  
  return defaultData;
}

// Helper function to create a styled paragraph
function createParagraph(text: string, options: {
  bold?: boolean;
  color?: string;
  size?: number;
  alignment?: typeof AlignmentType[keyof typeof AlignmentType];
  spacing?: { before?: number; after?: number };
  indent?: { left?: number };
} = {}): Paragraph {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: { ...options.spacing, line: 250 }, // 1.3x line spacing
    indent: options.indent,
    children: [
      new TextRun({
        text,
        bold: options.bold || false,
        color: options.color || COLORS.text,
        size: options.size || 22, // 11pt
        font: 'Times New Roman',
      }),
    ],
  });
}

// Helper function to create a heading
function createHeading(text: string, level: 1 | 2 | 3 = 2): Paragraph {
  const sizes = { 1: 28, 2: 24, 3: 22 };
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 300, after: 150, line: 250 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: COLORS.primary,
        size: sizes[level],
        font: 'Times New Roman',
      }),
    ],
  });
}

// Create data row for affiliate info
function createDataRow(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80, line: 250 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: value, size: 22, font: 'Times New Roman' }),
    ],
  });
}

// Create SCOMP results table
function createScompTable(title: string, data: Array<{ [key: string]: string }>, isAFP: boolean = false): Table {
  const headers = isAFP 
    ? ['AFP', 'Pensión en UF', 'Pensión Bruta $', 'Descuento 7% Salud $', 'Pensión Líquida $']
    : ['Compañía de Seguros', 'Pensión en UF', 'Pensión Bruta $', 'Descuento 7% Salud $', 'Pensión Líquida $'];
  
  const columnWidths = [2200, 1600, 1800, 2000, 1760];
  
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((header, i) => 
      new TableCell({
        borders: cellBorders,
        width: { size: columnWidths[i], type: WidthType.DXA },
        shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: header, bold: true, size: 18, font: 'Times New Roman' })],
        })],
      })
    ),
  });
  
  const dataRows = data.map((row, rowIndex) => {
    const values = isAFP 
      ? [row.afp, row.pensionUF, row.pensionBruta, row.descuentoSalud, row.pensionLiquida]
      : [row.compania, row.pensionUF, row.pensionBruta, row.descuentoSalud, row.pensionLiquida];
    
    return new TableRow({
      children: values.map((value, i) =>
        new TableCell({
          borders: cellBorders,
          width: { size: columnWidths[i], type: WidthType.DXA },
          shading: rowIndex % 2 === 1 ? { fill: COLORS.lightGray, type: ShadingType.CLEAR } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
            children: [new TextRun({ text: value || '-', size: 18, font: 'Times New Roman' })],
          })],
        })
      ),
    });
  });
  
  return new Table({
    columnWidths,
    rows: [headerRow, ...dataRows],
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

// Main function to generate the DOCX
export async function generateReportDocx(
  markdownReport: string,
  advisorInfo?: Partial<AdvisorInfo>
): Promise<Buffer> {
  const data = parseMarkdownReport(markdownReport, advisorInfo);
  const currentDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, color: COLORS.primary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 300, after: 150 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, color: COLORS.primary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 250, after: 100 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 22, bold: true, color: COLORS.primary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({
              text: 'Informe de Asesoría Previsional',
              italics: true,
              size: 18,
              color: '666666',
              font: 'Times New Roman',
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Página ', size: 18, font: 'Times New Roman' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Times New Roman' }),
              new TextRun({ text: ' de ', size: 18, font: 'Times New Roman' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Times New Roman' }),
            ],
          })],
        }),
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({
            text: 'Informe final de Asesoría Previsional',
            bold: true,
            size: 32,
            color: COLORS.primary,
            font: 'Times New Roman',
          })],
        }),
        
        // Date
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 300 },
          children: [new TextRun({
            text: `Fecha: ${currentDate}`,
            size: 20,
            font: 'Times New Roman',
          })],
        }),
        
        // Section 1: Affiliate Data
        createHeading('1) Antecedentes del afiliado y Solicitud de Ofertas', 2),
        createDataRow('Nombre Completo', data.nombreCompleto),
        createDataRow('RUT', data.rut),
        createDataRow('Fecha de Nacimiento', data.fechaNacimiento),
        createDataRow('Edad Cumplida (a la fecha actual)', data.edad),
        createDataRow('Sexo', data.sexo),
        createDataRow('Estado Civil', data.estadoCivil),
        createDataRow('AFP de Origen', data.afpOrigen),
        createDataRow('Institución de Salud', data.institucionSalud),
        createDataRow('Fecha Solicitud de Pensión', data.fechaSolicitudPension),
        createDataRow('Fecha Solicitud de Ofertas', data.fechaSolicitudOfertas),
        createDataRow('Tipo de Pensión Solicitada', data.tipoPension),
        
        // Certificate of Balances
        createHeading('Certificado de Saldos', 3),
        new Paragraph({
          spacing: { after: 200, line: 250 },
          children: [new TextRun({
            text: `El saldo total destinado a pensión es de ${data.saldoUF} UF. Este monto equivale a $${data.saldoPesos}. El valor de la UF utilizado es de $${data.valorUF} al ${data.fechaValorUF}. Este Certificado se encuentra vigente hasta el día ${data.vigenciaCertificado}.`,
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        
        // Section 2: Beneficiaries
        createHeading('2) Antecedentes del beneficiario', 2),
        new Paragraph({
          spacing: { after: 200, line: 250 },
          children: [new TextRun({
            text: data.beneficiarios.length > 0 
              ? 'El afiliado declara a los siguientes beneficiarios legales de pensión:'
              : 'El afiliado no declara beneficiarios legales de pensión.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        
        // Section 3: Pension Situation
        createHeading('3) Situación previsional', 2),
        createDataRow('Tipo de Pensión Solicitada', data.tipoPension),
        createDataRow('Saldo para Pensión', `UF ${data.saldoUF}`),
        createDataRow('Modalidades Solicitadas al SCOMP', data.modalidadesSolicitadas.join(', ')),
        
        // Section 4: Management
        createHeading('4) Gestiones realizadas', 2),
        createDataRow('Certificado de Saldos', `Emitido con fecha ${data.fechaCertificado}`),
        createDataRow('Solicitud de Ofertas (SCOMP)', `Certificado emitido el ${data.fechaScomp} (Consulta ${data.consultaScomp})`),
        createDataRow('Entidad de Asesoría', data.entidadAsesoria),
        createDataRow('Modalidades Solicitadas', data.modalidadesSolicitadas.join(', ')),
        
        // Section 5: SCOMP Results
        createHeading('5) Resultados SCOMP', 2),
        
        // a) Retiro Programado
        createHeading('a) Retiro Programado', 3),
        new Paragraph({
          spacing: { after: 150, line: 250 },
          children: [new TextRun({
            text: 'Es una modalidad de pensión que se paga con cargo a la Cuenta de Capitalización Individual del afiliado. La pensión se recalcula anualmente, considerando el saldo remanente, la expectativa de vida del afiliado y de sus beneficiarios, y la rentabilidad del fondo.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          spacing: { after: 100, line: 250 },
          children: [new TextRun({
            text: 'Cuadro de resultados:',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        data.retiroProgramado.length > 0 
          ? createScompTable('Retiro Programado', data.retiroProgramado, true)
          : createParagraph('No hay datos de Retiro Programado disponibles.'),
        
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        
        // b) Renta Vitalicia
        createHeading('b) Renta Vitalicia', 3),
        
        // Simple
        createHeading('Renta Vitalicia Inmediata Simple', 3),
        new Paragraph({
          spacing: { after: 150, line: 250 },
          children: [new TextRun({
            text: 'Es un contrato con una Compañía de Seguros, donde el afiliado traspasa la totalidad de su saldo para recibir una pensión mensual en UF fija y de por vida. El monto no varía, independiente de la rentabilidad del mercado o de la expectativa de vida.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          spacing: { after: 100, line: 250 },
          children: [new TextRun({
            text: 'Cuadro de resultados (4 mejores ofertas):',
            bold: true,
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        data.rentasVitalicias.simple.length > 0
          ? createScompTable('Renta Vitalicia Simple', data.rentasVitalicias.simple)
          : createParagraph('No hay datos disponibles.'),
        
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        
        // Guaranteed 120
        createHeading('Renta Vitalicia Inmediata Garantizada 120 Meses', 3),
        new Paragraph({
          spacing: { after: 150, line: 250 },
          children: [new TextRun({
            text: 'En esta modalidad, si el asegurado fallece durante el periodo garantizado (120 meses), los beneficiarios designados recibirán el 100% de la pensión hasta cumplir dicho plazo.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        data.rentasVitalicias.garantizada120.length > 0
          ? createScompTable('Garantizada 120', data.rentasVitalicias.garantizada120)
          : createParagraph('No hay datos disponibles.'),
        
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        
        // Guaranteed 180
        createHeading('Renta Vitalicia Inmediata Garantizada 180 Meses', 3),
        new Paragraph({
          spacing: { after: 150, line: 250 },
          children: [new TextRun({
            text: 'En esta modalidad, si el asegurado fallece durante el periodo garantizado (180 meses), los beneficiarios designados recibirán el 100% de la pensión hasta cumplir dicho plazo.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        data.rentasVitalicias.garantizada180.length > 0
          ? createScompTable('Garantizada 180', data.rentasVitalicias.garantizada180)
          : createParagraph('No hay datos disponibles.'),
        
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        
        // Guaranteed 240
        createHeading('Renta Vitalicia Inmediata Garantizada 240 Meses', 3),
        new Paragraph({
          spacing: { after: 150, line: 250 },
          children: [new TextRun({
            text: 'En esta modalidad, si el asegurado fallece durante el periodo garantizado (240 meses), los beneficiarios designados recibirán el 100% de la pensión hasta cumplir dicho plazo.',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        data.rentasVitalicias.garantizada240.length > 0
          ? createScompTable('Garantizada 240', data.rentasVitalicias.garantizada240)
          : createParagraph('No hay datos disponibles.'),
        
        new Paragraph({ spacing: { after: 300 }, children: [] }),
        
        // Section 6: Recommendation
        createHeading('6) Recomendación Final', 2),
        ...parseRecommendationToParagraphs(data.recomendacion),
        
        new Paragraph({ spacing: { after: 400 }, children: [] }),
        
        // Signature section
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [new TextRun({
            text: '____________________________________',
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({
            text: data.asesor.name,
            bold: true,
            size: 22,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({
            text: `RUT: ${data.asesor.rut}`,
            size: 20,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({
            text: `Asesor Previsional - Registro N° ${data.asesor.registryNumber}`,
            size: 20,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({
            text: data.asesor.entity,
            bold: true,
            size: 20,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({
            text: `Teléfono: ${data.asesor.phone} | Email: ${data.asesor.email}`,
            size: 18,
            font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: data.asesor.address,
            size: 18,
            font: 'Times New Roman',
          })],
        }),
      ],
    }],
  });
  
  return await Packer.toBuffer(doc);
}

// Helper function to parse recommendation into paragraphs
function parseRecommendationToParagraphs(recommendation: string): Paragraph[] {
  if (!recommendation) {
    return [createParagraph('No hay recomendación disponible.')];
  }
  
  const lines = recommendation.split('\n').filter(line => line.trim());
  const paragraphs: Paragraph[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if it's a heading
    if (trimmedLine.startsWith('### ')) {
      paragraphs.push(createHeading(trimmedLine.replace('### ', ''), 3));
    } else if (trimmedLine.startsWith('## ')) {
      paragraphs.push(createHeading(trimmedLine.replace('## ', ''), 2));
    } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      // Bold paragraph
      paragraphs.push(new Paragraph({
        spacing: { after: 150, line: 250 },
        children: [new TextRun({
          text: trimmedLine.replace(/\*\*/g, ''),
          bold: true,
          size: 22,
          font: 'Times New Roman',
        })],
      }));
    } else {
      // Regular paragraph - clean markdown formatting
      const cleanText = trimmedLine
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markers
        .replace(/\*([^*]+)\*/g, '$1')       // Remove italic markers
        .replace(/^[-•]\s*/, '');            // Remove bullet markers
      
      if (cleanText) {
        paragraphs.push(createParagraph(cleanText));
      }
    }
  }
  
  return paragraphs;
}

// Export types
export type { AdvisorInfo, ReportData };
