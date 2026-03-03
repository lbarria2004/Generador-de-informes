'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle2 } from 'lucide-react';

interface ReportViewerProps {
  content: string;
  verification?: string;
  className?: string;
}

export function ReportViewer({ content, verification, className }: ReportViewerProps) {
  const sections = useMemo(() => {
    if (!content) return [];
    // Split by section headers
    return content.split(/(?=## \d+\))/);
  }, [content]);

  const isApproved = verification?.includes('APROBADO');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Informe de Asesoría Previsional</CardTitle>
          </div>
          {verification && (
            <Badge 
              variant={isApproved ? 'default' : 'destructive'}
              className="gap-1"
            >
              {isApproved ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </>
              ) : (
                'Requiere Revisión'
              )}
            </Badge>
          )}
        </div>
        {verification && !isApproved && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {verification}
            </p>
          </div>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-primary mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-6 mb-3 text-primary/90">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-medium mt-3 mb-2 text-foreground/80">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed mb-2">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-1 text-sm">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 space-y-1 text-sm">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-medium border-b">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border-b border-border/50">{children}</td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <Separator className="my-4" />
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar
export function ReportViewerCompact({ content }: { content: string }) {
  const sections = useMemo(() => {
    if (!content) return [];
    const matches = content.match(/## \d+\).*?(?=## \d+\)|$)/gs);
    return matches || [];
  }, [content]);

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const title = section.match(/## (\d+\).*?)(?:\n|$)/)?.[1] || `Sección ${index + 1}`;
        return (
          <div key={index} className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
          </div>
        );
      })}
    </div>
  );
}
