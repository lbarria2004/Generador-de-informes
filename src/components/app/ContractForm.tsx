'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileSignature, 
  Download, 
  Loader2, 
  User,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { useAppState, extractContractDataFromReport } from '@/hooks/useAppState';
import type { ContractData, Beneficiario } from '@/types';
import { toast } from 'sonner';

interface ContractFormProps {
  onGenerate: (type: 'vejez_invalidez' | 'sobrevivencia', data: ContractData) => Promise<void>;
  isGenerating: boolean;
}

export function ContractForm({ onGenerate, isGenerating }: ContractFormProps) {
  const { currentReport, contractType, setContractType, contractData, setContractData } = useAppState();
  const [activeTab, setActiveTab] = useState<'vejez_invalidez' | 'sobrevivencia'>('vejez_invalidez');

  // Extract data from report when available
  useEffect(() => {
    if (currentReport) {
      const extracted = extractContractDataFromReport(currentReport);
      setContractData(extracted);
    }
  }, [currentReport, setContractData]);

  const handleFieldChange = (field: keyof ContractData, value: string) => {
    setContractData({
      ...contractData,
      [field]: value
    });
  };

  const handleGenerate = async () => {
    await onGenerate(activeTab, contractData);
  };

  const handleLoadFromReport = () => {
    if (currentReport) {
      const extracted = extractContractDataFromReport(currentReport);
      setContractData(extracted);
      toast.success('Datos cargados desde el informe');
    } else {
      toast.error('No hay informe disponible');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Generar Contrato</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadFromReport}
            disabled={!currentReport}
          >
            <FileText className="h-4 w-4 mr-1" />
            Cargar desde Informe
          </Button>
        </div>
        <CardDescription>
          Completa los datos para generar el contrato de asesoría
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vejez_invalidez" className="gap-2">
              <User className="h-4 w-4" />
              Vejez/Invalidez
            </TabsTrigger>
            <TabsTrigger value="sobrevivencia" className="gap-2">
              <Users className="h-4 w-4" />
              Sobrevivencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vejez_invalidez" className="space-y-4 mt-4">
            <ContractFields 
              data={contractData} 
              onChange={handleFieldChange} 
            />
          </TabsContent>

          <TabsContent value="sobrevivencia" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Datos del Causante (Fallecido)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nombre Causante</Label>
                    <Input
                      value={contractData.nombreCausante || ''}
                      onChange={(e) => handleFieldChange('nombreCausante', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">RUT Causante</Label>
                    <Input
                      value={contractData.rutCausante || ''}
                      onChange={(e) => handleFieldChange('rutCausante', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Datos del Consultante (Solicitante)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nombre Consultante</Label>
                    <Input
                      value={contractData.nombreConsultante || contractData.nombreAfiliado}
                      onChange={(e) => handleFieldChange('nombreConsultante', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">RUT Consultante</Label>
                    <Input
                      value={contractData.rutConsultante || contractData.rutAfiliado}
                      onChange={(e) => handleFieldChange('rutConsultante', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <ContractFields 
              data={contractData} 
              onChange={handleFieldChange} 
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {activeTab === 'vejez_invalidez' ? 'Vejez/Invalidez' : 'Sobrevivencia'}
            </Badge>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !contractData.nombreAfiliado || !contractData.rutAfiliado}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generar Contrato DOCX
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractFields({ 
  data, 
  onChange 
}: { 
  data: ContractData; 
  onChange: (field: keyof ContractData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Datos Personales */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Datos del Afiliado
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nombre Completo</Label>
            <Input
              value={data.nombreAfiliado}
              onChange={(e) => onChange('nombreAfiliado', e.target.value)}
              placeholder="Nombre completo del afiliado"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">RUT</Label>
            <Input
              value={data.rutAfiliado}
              onChange={(e) => onChange('rutAfiliado', e.target.value)}
              placeholder="12.345.678-9"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Fecha de Nacimiento</Label>
            <Input
              value={data.fechaNacimiento}
              onChange={(e) => onChange('fechaNacimiento', e.target.value)}
              placeholder="DD/MM/AAAA"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Estado Civil</Label>
            <Input
              value={data.estadoCivil}
              onChange={(e) => onChange('estadoCivil', e.target.value)}
              placeholder="Casado/a, Soltero/a"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Profesión/Oficio</Label>
            <Input
              value={data.profesion}
              onChange={(e) => onChange('profesion', e.target.value)}
              placeholder="Profesión u oficio"
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Building2 className="h-4 w-4" />
          Contacto y Domicilio
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Dirección</Label>
            <Input
              value={data.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              placeholder="Dirección"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Comuna</Label>
            <Input
              value={data.comuna}
              onChange={(e) => onChange('comuna', e.target.value)}
              placeholder="Comuna"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Ciudad</Label>
            <Input
              value={data.ciudad}
              onChange={(e) => onChange('ciudad', e.target.value)}
              placeholder="Ciudad"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Teléfono</Label>
            <Input
              value={data.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              placeholder="+56 9 1234 5678"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Previsional */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="h-4 w-4" />
          Datos Previsionales
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">AFP de Origen</Label>
            <Input
              value={data.afpOrigen}
              onChange={(e) => onChange('afpOrigen', e.target.value)}
              placeholder="AFP Modelo, Habitat, etc."
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Sistema de Salud</Label>
            <Input
              value={data.sistemaSalud}
              onChange={(e) => onChange('sistemaSalud', e.target.value)}
              placeholder="Fonasa, Isapre"
              className="h-9"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Tipo de Pensión</Label>
            <Input
              value={data.tipoPension}
              onChange={(e) => onChange('tipoPension', e.target.value)}
              placeholder="Vejez Edad, Invalidez, Sobrevivencia"
              className="h-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
