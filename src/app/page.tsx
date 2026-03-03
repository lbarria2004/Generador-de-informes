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
  X,
  ChevronRight,
  Shield,
  Zap,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useAppState, extractContractDataFromReport } from '@/hooks/useAppState';
import { FileUploader } from '@/components/app/FileUploader';
import { ProgressStepper } from '@/components/app/ProgressStepper';
import { ReportViewer } from '@/components/app/ReportViewer';
import { ReportEditor, RecommendationGenerator } from '@/components/app/ReportEditor';
import { ContractForm } from '@/components/app/ContractForm';
import type { ContractData } from '@/types';
import { toast } from 'sonner';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    documents,
    currentReport,
    setCurrentReport,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    currentStep,
    setCurrentStep,
    setContractData,
    resetAll
  } = useAppState();

  // Analyze documents
  const handleAnalyze = useCallback(async () => {
    if (documents.length === 0) {
      toast.error('Primero carga los documentos PDF');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analizando documentos con IA...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: documents.map(d => ({
            name: d.name,
            base64: d.base64
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setLoadingMessage('Generando informe...');
        
        // Generate report from analyzed context
        const reportResponse = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: data.data.context
          })
        });

        const reportData = await reportResponse.json();

        if (reportData.success) {
          setCurrentReport(reportData.data.report);
          setCurrentStep(2);
          toast.success('Informe generado exitosamente');
          
          if (reportData.data.verification) {
            if (reportData.data.verification.includes('APROBADO')) {
              toast.success('Verificación aprobada: Informe completo');
            } else {
              toast.warning('El informe requiere revisión');
            }
          }
        } else {
          throw new Error(reportData.error);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al analizar documentos');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [documents, setCurrentReport, setCurrentStep, setIsLoading, setLoadingMessage]);

  // Modify report
  const handleModify = useCallback(async (instructions: string) => {
    if (!currentReport) return;

    setIsLoading(true);
    setLoadingMessage('Aplicando modificaciones...');

    try {
      const response = await fetch('/api/modify-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: currentReport,
          instructions
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentReport(data.data.report);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentReport, setCurrentReport, setIsLoading, setLoadingMessage]);

  // Generate recommendation
  const handleGenerateRecommendation = useCallback(async (instructions: string) => {
    if (!currentReport) return;

    setIsLoading(true);
    setLoadingMessage('Generando recomendación...');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: currentReport,
          instructions
        })
      });

      const data = await response.json();

      if (data.success) {
        // Append recommendation to report
        const newReport = currentReport + '\n\n' + data.data.report;
        setCurrentReport(newReport);
        toast.success('Recomendación generada');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentReport, setCurrentReport, setIsLoading, setLoadingMessage]);

  // Generate contract
  const handleGenerateContract = useCallback(async (
    type: 'vejez_invalidez' | 'sobrevivencia',
    data: ContractData
  ) => {
    setIsLoading(true);
    setLoadingMessage('Generando contrato...');

    try {
      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType: type,
          contractData: data
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar contrato');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'sobrevivencia' 
        ? 'Contrato_Asesoria_Sobrevivencia.txt'
        : 'Contrato_Asesoria_Vejez_Invalidez.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Contrato descargado');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [setCurrentStep, setIsLoading, setLoadingMessage]);

  // Download report as markdown
  const handleDownloadReport = useCallback(() => {
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
    resetAll();
    toast.info('Sesión reiniciada');
  }, [resetAll]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    Acciones Rápidas
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <SidebarContent 
                    onAnalyze={handleAnalyze}
                    onDownload={handleDownloadReport}
                    onReset={handleReset}
                    hasDocuments={documents.length > 0}
                    hasReport={!!currentReport}
                    isLoading={isLoading}
                  />
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
                  Sistema Inteligente de Pensiones
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Potenciado por IA
            </Badge>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Progress Stepper */}
        <div className="mb-8 p-6 rounded-xl bg-card border">
          <ProgressStepper />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Card */}
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Documentos</CardTitle>
                </div>
                <CardDescription>
                  Sube los PDFs del cliente (SCOMP, Certificados, Cartolas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onUploadComplete={() => setCurrentStep(1)} />
                
                {documents.length > 0 && !currentReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={handleAnalyze}
                      disabled={isLoading}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="h-5 w-5" />
                          </motion.div>
                          {loadingMessage || 'Analizando...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Generar Informe con IA
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Actions (Desktop) */}
            <div className="hidden md:block space-y-4">
              <Separator />
              <SidebarContent 
                onAnalyze={handleAnalyze}
                onDownload={handleDownloadReport}
                onReset={handleReset}
                hasDocuments={documents.length > 0}
                hasReport={!!currentReport}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Panel - Report & Editor */}
          <div className="lg:col-span-2 space-y-6">
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
                        Sube los documentos PDF del cliente y haz clic en "Generar Informe con IA" 
                        para crear el informe de asesoría previsional.
                      </p>
                      
                      {documents.length === 0 && (
                        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-primary flex items-center gap-2">
                            <ChevronRight className="h-4 w-4" />
                            Comienza cargando los documentos en el panel izquierdo
                          </p>
                        </div>
                      )}
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
                  <ReportViewer content={currentReport} />

                  {/* Editor Tools */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <ReportEditor onModify={handleModify} isModifying={isLoading} />
                    <RecommendationGenerator 
                      onGenerate={handleGenerateRecommendation} 
                      isGenerating={isLoading} 
                    />
                  </div>

                  {/* Contract Form */}
                  <ContractForm 
                    onGenerate={handleGenerateContract}
                    isGenerating={isLoading}
                  />
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
              © 2024 Asesoría Previsional IA. Sistema de asesoría inteligente para pensiones.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Datos seguros
              </span>
              <span className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                IA Avanzada
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
                <p className="text-lg font-medium">{loadingMessage || 'Procesando...'}</p>
                <p className="text-sm text-muted-foreground">
                  Esto puede tardar unos segundos
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({
  onAnalyze,
  onDownload,
  onReset,
  hasDocuments,
  hasReport,
  isLoading
}: {
  onAnalyze: () => void;
  onDownload: () => void;
  onReset: () => void;
  hasDocuments: boolean;
  hasReport: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onAnalyze}
        disabled={!hasDocuments || isLoading || hasReport}
      >
        <Sparkles className="h-4 w-4" />
        Generar Informe
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onDownload}
        disabled={!hasReport || isLoading}
      >
        <Download className="h-4 w-4" />
        Descargar Informe
      </Button>

      <Separator />

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
        onClick={onReset}
        disabled={isLoading}
      >
        <RotateCcw className="h-4 w-4" />
        Nuevo Informe
      </Button>
    </div>
  );
}
