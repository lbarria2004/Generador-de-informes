'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { toast } from 'sonner';

interface ReportEditorProps {
  onModify: (instructions: string) => Promise<void>;
  isModifying: boolean;
}

export function ReportEditor({ onModify, isModifying }: ReportEditorProps) {
  const [instructions, setInstructions] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const { currentReport } = useAppState();

  const handleModify = useCallback(async () => {
    if (!instructions.trim()) {
      toast.error('Ingresa instrucciones de modificación');
      return;
    }

    // Save to history
    setHistory(prev => [instructions, ...prev.slice(0, 9)]);

    try {
      await onModify(instructions);
      setInstructions('');
      toast.success('Informe modificado exitosamente');
    } catch {
      toast.error('Error al modificar el informe');
    }
  }, [instructions, onModify]);

  const quickActions = [
    'Acorta la sección de retiro programado',
    'Agrega más detalle en la recomendación',
    'Corrige el formato de las tablas',
    'Simplifica la descripción de modalidades',
    'Elimina información redundante'
  ];

  const handleQuickAction = (action: string) => {
    setInstructions(action);
  };

  const handleHistorySelect = (pastInstruction: string) => {
    setInstructions(pastInstruction);
    setShowHistory(false);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Modificar Informe</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            IA Potenciada
          </Badge>
        </div>
        <CardDescription>
          Usa lenguaje natural para modificar el informe generado
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleQuickAction(action)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {action.length > 30 ? action.slice(0, 30) + '...' : action}
            </Button>
          ))}
        </div>

        {/* Main input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Escribe tus instrucciones aquí... Ej: 'Elimina los puntos 1 y 2 de la nota', 'Acorta la sección 6', 'Cambia el tono a más formal'"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isModifying || !currentReport}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-3 w-3 mr-1" />
                  Historial
                  {showHistory ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )}
            </div>

            <Button
              onClick={handleModify}
              disabled={isModifying || !instructions.trim() || !currentReport}
              className="gap-2"
            >
              {isModifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Modificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Aplicar Modificación
                </>
              )}
            </Button>
          </div>
        </div>

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-2 bg-muted/50 text-xs font-medium">
              Instrucciones anteriores
            </div>
            <div className="divide-y max-h-[200px] overflow-y-auto">
              {history.map((pastInstruction, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm hover:bg-muted/30 transition-colors"
                  onClick={() => handleHistorySelect(pastInstruction)}
                >
                  {pastInstruction}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Recommendation Generator Component
interface RecommendationGeneratorProps {
  onGenerate: (instructions: string) => Promise<void>;
  isGenerating: boolean;
}

export function RecommendationGenerator({ onGenerate, isGenerating }: RecommendationGeneratorProps) {
  const [instructions, setInstructions] = useState('');
  const { currentReport } = useAppState();

  const handleGenerate = useCallback(async () => {
    if (!instructions.trim()) {
      await onGenerate('Genera una recomendación profesional basada en los datos del informe.');
    } else {
      await onGenerate(instructions);
    }
  }, [instructions, onGenerate]);

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Generar Recomendación</CardTitle>
        </div>
        <CardDescription>
          Genera la Sección 6 con recomendación personalizada
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        <Textarea
          placeholder="Instrucciones opcionales para la recomendación... Ej: 'Recomienda la renta vitalicia de Compañía X por la mejor oferta', 'Considera que el cliente tiene deudas'"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[80px] resize-none"
          disabled={isGenerating || !currentReport}
        />

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !currentReport}
          className="w-full bg-amber-500 hover:bg-amber-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando recomendación...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Recomendación Final
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
