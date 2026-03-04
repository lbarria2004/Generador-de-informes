'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Moon, 
  Sun,
  Menu,
  Shield,
  Brain,
  Key,
  CheckCircle2,
  ExternalLink,
  Loader2,
  FileUp,
  Trash2,
  FileDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { downloadDocxReport, type AdvisorInfo } from '@/lib/docx-generator';

// Types
interface DocumentUpload {
  id: string;
  name: string;
  size: number;
  base64: string;
  type: string;
}

// API Key Input Component
function ApiKeyInput({ 
  apiKey, 
  setApiKey,
  isValid,
  setIsValid 
}: { 
  apiKey: string; 
  setApiKey: (key: string) => void;
  isValid: boolean;
  setIsValid: (valid: boolean) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  const validateKey = (key: string) => {
    const valid = key.startsWith('AIza') && key.length > 30;
    setIsValid(valid);
    return valid;
  };

  return (
    <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg">API Key de Google Gemini</CardTitle>
        </div>
        <CardDescription>
          Necesitas una API Key de Google AI Studio para usar esta aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                validateKey(e.target.value);
              }}
              className={isValid ? 'border-green-500' : ''}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <X className="h-4 w-4" /> : <Key className="h-4 w-4" />}
          </Button>
        </div>
        
        {isValid && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>API Key válida</span>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            <strong>¿No tienes API Key?</strong>{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline inline-flex items-center gap-1"
            >
              Obtén tu clave gratuita aquí
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// File Uploader Component
function FileUploaderComponent({
  documents,
  setDocuments
}: {
  documents: DocumentUpload[];
  setDocuments: (docs: DocumentUpload[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const isValidType = file.type === 'application/pdf' ||
                          file.type.startsWith('image/') ||
                          file.name.toLowerCase().endsWith('.pdf');

      if (isValidType) {
        try {
          const base64 = await fileToBase64(file);
          const doc: DocumentUpload = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            base64: base64,
            type: file.type
          };
          // Use functional update to avoid dependency on documents
          setDocuments(prev => [...prev, doc]);
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error(`Error al procesar ${file.name}`);
        }
      } else {
        toast.error(`${file.name} no es un archivo válido (PDF o imagen)`);
      }
    }

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          }
          ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileUp className="h-8 w-8" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isProcessing ? 'Procesando...' : 'Arrastra PDFs o imágenes aquí'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              SCOMP, Certificados, Cartolas (cualquier tamaño)
            </p>
          </div>
          
          <Badge variant="secondary">
            PDF, PNG, JPG, JPEG
          </Badge>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Documentos cargados ({documents.length})
          </p>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {documents.map((doc) => (
              <Card key={doc.id} className="group">
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(doc.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(doc.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analyze document directly with Gemini API from client (bypasses Vercel limits)
async function analyzeWithGeminiDirect(
  base64Data: string,
  mimeType: string,
  documentName: string,
  apiKey: string
): Promise<string> {
  const prompt = `Eres un experto en análisis de documentos previsionales chilenos. Tu tarea es extraer TODA la información del documento proporcionado.

INSTRUCCIONES CRÍTICAS:
1. Transcribe TODOS los datos con precisión EXACTA - especial atención a montos en UF y pesos
2. Si ves tablas SCOMP, transcribe TODAS las filas y columnas sin omitir ninguna
3. Extrae datos del afiliado: nombre, RUT, fecha nacimiento, sexo, estado civil, AFP
4. Extrae montos: saldos en UF, pensiones en UF y pesos, descuentos de salud
5. Identifica beneficiarios declarados
6. Indica claramente el tipo de documento (SCOMP, Certificado de Saldo, Solicitud, etc.)
7. Para tablas de resultados SCOMP: incluye TODAS las AFP y compañías de seguros con sus montos

DOCUMENTO A ANALIZAR: ${documentName}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
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
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de Gemini: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return `=== DOCUMENTO: ${documentName} ===\n${text}`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main Page
export default function Home() {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [currentReport, setCurrentReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [modificationInstructions, setModificationInstructions] = useState('');
  
  // Advisor info state
  const [advisorInfo, setAdvisorInfo] = useState<AdvisorInfo>({
    name: '',
    rut: '',
    registryNumber: '',
    entity: '',
    phone: '',
    email: '',
    address: '',
  });
  const [showAdvisorForm, setShowAdvisorForm] = useState(false);

  // Analyze documents - Call Gemini directly from client (bypasses Vercel limits)
  const handleAnalyze = useCallback(async () => {
    if (!apiKeyValid) {
      toast.error('Ingresa una API Key válida de Google Gemini');
      return;
    }

    if (documents.length === 0) {
      toast.error('Primero carga los documentos');
      return;
    }

    setIsLoading(true);
    const allResults: string[] = [];

    try {
      // Analyze each document directly with Gemini API
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        setLoadingMessage(`Analizando documento ${i + 1}/${documents.length}: ${doc.name}`);

        try {
          // Call Gemini API directly from client
          const result = await analyzeWithGeminiDirect(
            doc.base64,
            doc.type || 'application/pdf',
            doc.name,
            apiKey
          );
          allResults.push(result);
        } catch (analyzeError) {
          console.error(`Error with document ${doc.name}:`, analyzeError);
          allResults.push(`=== ERROR EN DOCUMENTO: ${doc.name} ===\n${analyzeError instanceof Error ? analyzeError.message : 'Error desconocido'}`);
          toast.error(`Error en ${doc.name}`);
        }
      }

      // Combine all results
      const combinedContext = allResults.join('\n\n---\n\n');

      setLoadingMessage('Generando informe con IA...');

      // Generate report using backend (small text payload, within limits)
      const reportResponse = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: combinedContext,
          apiKey: apiKey
        })
      });

      const reportData = await reportResponse.json();

      if (!reportData.success) {
        throw new Error(reportData.error || 'Error al generar informe');
      }

      setCurrentReport(reportData.data.report);
      toast.success('Informe generado exitosamente');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [apiKey, apiKeyValid, documents]);

  // Modify report
  const handleModify = useCallback(async () => {
    if (!currentReport || !modificationInstructions.trim()) return;

    setIsLoading(true);
    setLoadingMessage('Aplicando modificaciones...');

    try {
      const response = await fetch('/api/modify-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: currentReport,
          instructions: modificationInstructions,
          apiKey: apiKey
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al modificar');
      }

      setCurrentReport(data.data.report);
      setModificationInstructions('');
      toast.success('Informe modificado');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al modificar');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentReport, modificationInstructions, apiKey]);

  // Download report as DOCX
  const handleDownload = useCallback(async () => {
    if (!currentReport) return;

    try {
      toast.info('Generando documento Word...');
      await downloadDocxReport(currentReport, advisorInfo);
      toast.success('Informe DOCX descargado');
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Error al generar el documento');
    }
  }, [currentReport, advisorInfo]);

  // Reset
  const handleReset = useCallback(() => {
    setDocuments([]);
    setCurrentReport('');
    setModificationInstructions('');
    toast.info('Sesión reiniciada');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Acciones
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleAnalyze}
                    disabled={!apiKeyValid || documents.length === 0 || isLoading}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generar Informe
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleDownload}
                    disabled={!currentReport || isLoading}
                  >
                    <Download className="h-4 w-4" />
                    Descargar Informe
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nuevo Informe
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Asesoría Previsional IA
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Sistema Inteligente con Google Gemini
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Google Gemini
            </Badge>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Key Input */}
            <ApiKeyInput 
              apiKey={apiKey}
              setApiKey={setApiKey}
              isValid={apiKeyValid}
              setIsValid={setApiKeyValid}
            />

            {/* Upload Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Documentos</CardTitle>
                </div>
                <CardDescription>
                  Sube PDFs de cualquier tamaño (SCOMP, Certificados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploaderComponent 
                  documents={documents}
                  setDocuments={setDocuments}
                />
                
                {documents.length > 0 && !currentReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={handleAnalyze}
                      disabled={isLoading || !apiKeyValid}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Analizar con Gemini Vision
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Desktop Actions */}
            <div className="hidden md:block space-y-4">
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleDownload}
                disabled={!currentReport || isLoading}
              >
                <Download className="h-4 w-4" />
                Descargar Informe
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleReset}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4" />
                Nuevo Informe
              </Button>
            </div>
          </div>

          {/* Right Panel - Report */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!currentReport ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        No hay informe generado
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        1. Ingresa tu API Key de Google Gemini
                        <br />
                        2. Sube los documentos PDF del cliente
                        <br />
                        3. Haz clic en "Analizar con Gemini Vision"
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Report Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Informe de Asesoría Previsional</h2>
                    </div>
                    <Button 
                      onClick={handleDownload} 
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <FileDown className="h-4 w-4" />
                      Descargar DOCX
                    </Button>
                  </div>

                  {/* Report Viewer */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <ScrollArea className="h-[550px]">
                        <div className="p-6">
                          <div className="report-container">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary/20">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold text-primary mt-6 mb-3 pb-1 border-b border-primary/10">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                                    {children}
                                  </h3>
                                ),
                                h4: ({ children }) => (
                                  <h4 className="text-base font-medium text-muted-foreground mt-3 mb-2">
                                    {children}
                                  </h4>
                                ),
                                p: ({ children }) => (
                                  <p className="text-sm leading-relaxed mb-2 text-foreground/90">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside space-y-1 my-2 ml-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-1 my-2 ml-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm text-foreground/90">
                                    {children}
                                  </li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-foreground">
                                    {children}
                                  </strong>
                                ),
                                table: ({ children }) => (
                                  <div className="my-4 overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-primary/10">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-4 py-2 text-left font-semibold text-foreground border-b border-border">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-4 py-2 border-b border-border/50 text-foreground/90">
                                    {children}
                                  </td>
                                ),
                                tr: ({ children }) => (
                                  <tr className="hover:bg-muted/30 transition-colors">
                                    {children}
                                  </tr>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-primary/50 pl-4 my-3 italic text-muted-foreground">
                                    {children}
                                  </blockquote>
                                ),
                                hr: () => (
                                  <hr className="my-6 border-t border-border" />
                                ),
                              }}
                            >
                              {currentReport}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Modification */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Modificar Informe</CardTitle>
                      <CardDescription>
                        Escribe instrucciones en lenguaje natural para modificar el informe
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Ej: 'Elimina la sección de beneficiarios', 'Acorta la recomendación', 'Cambia el tono a más formal'"
                        value={modificationInstructions}
                        onChange={(e) => setModificationInstructions(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={handleModify}
                        disabled={isLoading || !modificationInstructions.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Modificando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Aplicar Modificación
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Advisor Info for Signature */}
                  <Card>
                    <CardHeader className="cursor-pointer" onClick={() => setShowAdvisorForm(!showAdvisorForm)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Datos del Asesor Previsional</CardTitle>
                          <CardDescription>
                            Información que aparecerá en el pie de firma del documento
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          {showAdvisorForm ? 'Ocultar' : 'Editar'}
                        </Button>
                      </div>
                    </CardHeader>
                    {showAdvisorForm && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="advisorName">Nombre Completo</Label>
                            <Input
                              id="advisorName"
                              placeholder="Juan Pérez López"
                              value={advisorInfo.name}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="advisorRut">RUT</Label>
                            <Input
                              id="advisorRut"
                              placeholder="12.345.678-9"
                              value={advisorInfo.rut}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, rut: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="registryNumber">N° Registro</Label>
                            <Input
                              id="registryNumber"
                              placeholder="12345"
                              value={advisorInfo.registryNumber}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, registryNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity">Entidad de Asesoría</Label>
                            <Input
                              id="entity"
                              placeholder="Asesoría Previsional XYZ"
                              value={advisorInfo.entity}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, entity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              placeholder="+56 9 1234 5678"
                              value={advisorInfo.phone}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="correo@ejemplo.com"
                              value={advisorInfo.email}
                              onChange={(e) => setAdvisorInfo({ ...advisorInfo, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            placeholder="Calle 123, Ciudad"
                            value={advisorInfo.address}
                            onChange={(e) => setAdvisorInfo({ ...advisorInfo, address: e.target.value })}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Asesoría Previsional IA - Powered by Google Gemini
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Datos seguros
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Card className="p-8">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="p-4 rounded-full bg-primary/10"
                >
                  <Brain className="h-8 w-8 text-primary" />
                </motion.div>
                <p className="text-lg font-medium">{loadingMessage}</p>
                <p className="text-sm text-muted-foreground">
                  Procesando con Google Gemini...
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
