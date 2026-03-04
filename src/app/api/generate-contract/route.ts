import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, VerticalAlign, ShadingType, Header, Footer, PageNumber, HeadingLevel } from 'docx';
import type { ContractData, Beneficiario } from '@/types';

export const runtime = 'nodejs';

// Color scheme
const colors = {
  primary: '0B1220',
  body: '0F172A',
  secondary: '2B2B2B',
  accent: '9AA6B2',
  tableBg: 'F1F5F9',
  headerBg: 'E2E8F0'
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

function createHeaderCell(text: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    shading: { fill: colors.headerBg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 20, color: colors.primary })]
      })
    ]
  });
}

function createDataCell(text: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: text || '-', size: 20, color: colors.body })]
      })
    ]
  });
}

function createBeneficiariesTable(beneficiarios: Beneficiario[]): Table {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('Nombre'),
        createHeaderCell('RUT'),
        createHeaderCell('Parentesco'),
        createHeaderCell('Sexo'),
        createHeaderCell('Invalidez'),
        createHeaderCell('Fecha Nac.')
      ]
    }),
    ...beneficiarios.map(b => new TableRow({
      children: [
        createDataCell(b.nombre || ''),
        createDataCell(b.rut || ''),
        createDataCell(b.parentesco || ''),
        createDataCell(b.sexo || ''),
        createDataCell(b.invalidez || ''),
        createDataCell(b.fechaNacimiento || '')
      ]
    }))
  ];

  return new Table({
    columnWidths: [2400, 1600, 1600, 1000, 1200, 1560],
    rows,
    margins: { top: 80, bottom: 80, left: 120, right: 120 }
  });
}

function createFieldParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: colors.primary }),
      new TextRun({ text: value || '____________________', size: 22, color: colors.body })
    ]
  });
}

function createVejezInvalidezContract(data: ContractData): Document {
  const today = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 }
        }
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { size: 36, bold: true, color: colors.primary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER }
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 26, bold: true, color: colors.primary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 300, after: 150 } }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, color: colors.secondary, font: 'Times New Roman' },
          paragraph: { spacing: { before: 200, after: 100 } }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Contrato de Asesoría Previsional',
                    size: 18,
                    color: colors.accent,
                    italics: true
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Página ', size: 18, color: colors.accent }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: colors.accent }),
                  new TextRun({ text: ' de ', size: 18, color: colors.accent }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: colors.accent })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: 'CONTRATO DE ASESORÍA PREVISIONAL', bold: true })]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `${data.ciudad || '_______________'}, ${today}`,
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: 'ENTRE:', bold: true, size: 24, color: colors.primary })]
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Por una parte, ${data.nombreAfiliado || '________________________________'}, RUT ${data.rutAfiliado || '________________________'}, de profesión ${data.profesion || '________________________'}, estado civil ${data.estadoCivil || '________________________'}, domiciliado en ${data.direccion || '________________________'}, comuna ${data.comuna || '________________________'}, ciudad ${data.ciudad || '________________________'}, teléfono ${data.telefono || data.celular || '________________________'}, correo electrónico ${data.email || '________________________'}, en adelante "EL AFILIADO";`,
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Y por otra parte, el Asesor Previsional inscrito en el Registro de Asesores Previsionales, en adelante "EL ASESOR";',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'PRIMERO: ANTECEDENTES DEL AFILIADO' })]
          }),

          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: 'El Afiliado declara ser afiliado al sistema de pensiones, en la AFP ',
                size: 22,
                color: colors.body
              }),
              new TextRun({
                text: data.afpOrigen || '________________________',
                bold: true,
                size: 22,
                color: colors.body
              }),
              new TextRun({
                text: ', con un saldo para pensión de acuerdo al certificado de saldo adjunto.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          createFieldParagraph('Fecha de Nacimiento', data.fechaNacimiento),
          createFieldParagraph('Sistema de Salud', data.sistemaSalud),
          createFieldParagraph('Tipo de Pensión', data.tipoPension),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'SEGUNDO: OBJETO DEL CONTRATO' })]
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'El presente contrato tiene por objeto establecer los términos y condiciones bajo los cuales EL ASESOR prestará servicios de asesoría previsional a EL AFILIADO, para el trámite de pensión ante las Administradoras de Fondos de Pensiones y Compañías de Seguros de Vida.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'TERCERO: SERVICIOS' })]
          }),

          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: 'EL ASESOR se compromete a:', size: 22, color: colors.body })]
          }),

          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'a) Orientar a EL AFILIADO sobre las diferentes modalidades de pensión disponibles.', size: 22, color: colors.body })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'b) Gestionar la Solicitud de Ofertas (SCOMP) ante las entidades correspondientes.', size: 22, color: colors.body })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'c) Analizar y comparar las ofertas recibidas.', size: 22, color: colors.body })
            ]
          }),
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'd) Elaborar informe de asesoría con recomendación fundada.', size: 22, color: colors.body })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: 'e) Acompañar en el proceso de toma de decisiones.', size: 22, color: colors.body })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'CUARTO: HONORARIOS' })]
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Los honorarios por los servicios prestados se acordarán entre las partes y se cancelarán de acuerdo a lo establecido en el Anexo de Honorarios.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'QUINTO: CONFIDENCIALIDAD' })]
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'EL ASESOR se compromete a mantener la confidencialidad de toda la información proporcionada por EL AFILIADO, conforme a lo establecido en la Ley N° 19.628 sobre protección de datos personales.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'SEXTO: VIGENCIA' })]
          }),

          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'El presente contrato tendrá vigencia desde la fecha de su firma hasta la conclusión de los servicios contratados.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 600, after: 200 },
            children: [
              new TextRun({
                text: 'En prueba de conformidad, las partes firman el presente contrato en dos ejemplares, en la fecha indicada.',
                size: 22,
                color: colors.body
              })
            ]
          }),

          new Paragraph({ spacing: { before: 600 }, children: [] }),

          new Table({
            columnWidths: [4680, 4680],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: '_______________________________', size: 22, color: colors.body })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100 },
                        children: [new TextRun({ text: 'EL AFILIADO', bold: true, size: 20, color: colors.primary })]
                      })
                    ]
                  }),
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: '_______________________________', size: 22, color: colors.body })]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100 },
                        children: [new TextRun({ text: 'EL ASESOR', bold: true, size: 20, color: colors.primary })]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractType, contractData } = body as {
      contractType: 'vejez_invalidez' | 'sobrevivencia';
      contractData: ContractData;
    };

    if (!contractType || !contractData) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos para generar el contrato' },
        { status: 400 }
      );
    }

    const doc = createVejezInvalidezContract(contractData);
    const buffer = await Packer.toBuffer(doc);

    const contractName = contractType === 'sobrevivencia'
      ? 'Contrato_Asesoria_Sobrevivencia.docx'
      : 'Contrato_Asesoria_Vejez_Invalidez.docx';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${contractName}"`
      }
    });
  } catch (error) {
    console.error('Error in generate-contract API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar el contrato'
      },
      { status: 500 }
    );
  }
}
