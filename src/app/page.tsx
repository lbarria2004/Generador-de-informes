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
  ChevronRight,
  Shield,
  Zap,
  Brain,
  Key,
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
  FileUp,
  Trash2
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
import type { ContractData, Beneficiario } from '@/types';

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

  // Analyze documents
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
    setLoadingMessage('Analizando documentos con Gemini Vision (OCR)...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: documents.map(d => ({
            name: d.name,
            base64: d.base64,
            type: d.type
          })),
          apiKey: apiKey
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al analizar documentos');
      }

      setLoadingMessage('Generando informe con IA...');

      // Generate report
      const reportResponse = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: data.data.context,
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

  // Download report
  const handleDownload = useCallback(() => {
    if (!currentReport) return;

    const blob = new Blob([currentReport], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Informe_Asesoria_Previsional.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Informe descargado');
  }, [currentReport]);

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
                  {/* Report Viewer */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Informe de Asesoría Previsional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{currentReport}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Modification */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Modificar Informe</CardTitle>
                      <CardDescription>
                        Escribe instrucciones para modificar el informe
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
