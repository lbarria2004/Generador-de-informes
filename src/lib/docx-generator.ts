import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
} from 'docx';

interface ParsedSection {
  title: string;
  level: number;
  content: string[];
  isTable: boolean;
  tableData?: string[][];
}

// Parse markdown to structured content
function parseMarkdownToSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split('\n');
  let currentSection: ParsedSection | null = null;
  let tableRows: string[][] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      if (inTable && tableRows.length > 0) {
        if (currentSection) {
          currentSection.isTable = true;
          currentSection.tableData = tableRows;
        }
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // Headers
    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.replace('## ', ''), level: 2, content: [], isTable: false };
      continue;
    }
    if (line.startsWith('### ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.replace('### ', ''), level: 3, content: [], isTable: false };
      continue;
    }
    if (line.startsWith('#### ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.replace('#### ', ''), level: 4, content: [], isTable: false };
      continue;
    }

    // Table detection
    if (line.startsWith('|')) {
      if (!inTable) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: '', level: 0, content: [], isTable: true, tableData: [] };
        inTable = true;
      }
      
      // Skip separator lines
      if (line.match(/^\|[\s\-:|]+\|$/)) continue;
      
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length > 0) {
        tableRows.push(cells);
      }
      continue;
    }

    // Regular content
    if (inTable && tableRows.length > 0) {
      if (currentSection) {
        currentSection.isTable = true;
        currentSection.tableData = tableRows;
      }
      inTable = false;
      tableRows = [];
    }

    if (!currentSection) {
      currentSection = { title: '', level: 0, content: [], isTable: false };
    }

    // Format bold text
    const formattedLine = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1');
    
    currentSection.content.push(formattedLine);
  }

  if (currentSection) {
    if (inTable && tableRows.length > 0) {
      currentSection.isTable = true;
      currentSection.tableData = tableRows;
    }
    sections.push(currentSection);
  }

  return sections;
}

// Create a professional DOCX document
export async function generateDocxReport(markdown: string): Promise<Blob> {
  const sections = parseMarkdownToSections(markdown);
  const children: (Paragraph | Table)[] = [];

  // Header with date
  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'INFORME DE ASESORÍA PREVISIONAL',
          bold: true,
          size: 32,
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Fecha: ${fechaHoy}`,
          size: 22,
          font: 'Arial',
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Process each section
  for (const section of sections) {
    // Section title
    if (section.title) {
      const headingLevel = section.level === 2 ? HeadingLevel.HEADING_2 :
                          section.level === 3 ? HeadingLevel.HEADING_3 :
                          HeadingLevel.HEADING_4;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: section.level === 2 ? 26 : section.level === 3 ? 24 : 22,
              font: 'Arial',
              color: '1a365d',
            }),
          ],
          heading: headingLevel,
          spacing: { before: 300, after: 200 },
        })
      );
    }

    // Table content
    if (section.isTable && section.tableData && section.tableData.length > 0) {
      const tableRows = section.tableData.map((row, rowIndex) => {
        return new TableRow({
          children: row.map(cell => {
            return new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell,
                      bold: rowIndex === 0,
                      size: 20,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
              shading: rowIndex === 0 ? { fill: 'E2E8F0' } : undefined,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E0' },
              },
            });
          }),
        });
      });

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      children.push(
        new Paragraph({
          children: [],
          spacing: { after: 200 },
        })
      );
    }

    // Regular text content
    for (const content of section.content) {
      if (content.startsWith('* ') || content.startsWith('- ')) {
        // Bullet point
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '• ' + content.substring(2),
                size: 22,
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 360 },
          })
        );
      } else {
        // Regular paragraph
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: content,
                size: 22,
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '—',
          size: 22,
          font: 'Arial',
          color: '666666',
        }),
      ],
      spacing: { before: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Este informe fue generado con el apoyo de Inteligencia Artificial (Google Gemini).',
          size: 18,
          font: 'Arial',
          italics: true,
          color: '666666',
        }),
      ],
      spacing: { after: 100 },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBlob(doc);
}

// Download the DOCX file
export async function downloadDocxReport(markdown: string, filename: string = 'Informe_Asesoria_Previsional.docx') {
  const blob = await generateDocxReport(markdown);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
