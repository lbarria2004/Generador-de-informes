// Types for the Pension Advisory AI Application

export interface Afiliado {
  nombreCompleto: string;
  rut: string;
  fechaNacimiento: string;
  edadCumplida: string;
  sexo: string;
  estadoCivil: string;
  afpOrigen: string;
  institucionSalud: string;
  fechaSolicitudPension: string;
  fechaSolicitudOfertas: string;
  tipoPensionSolicitada: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  profesion?: string;
}

export interface Beneficiario {
  nombre: string;
  rut: string;
  parentesco: string;
  sexo: string;
  invalidez: string;
  fechaNacimiento: string;
}

export interface CertificadoSaldo {
  fondo: string;
  saldoUF: string;
  saldoPesos: string;
  valorUF: string;
  fechaUF: string;
  vigenciaSaldo: string;
}

export interface ResultadoAFP {
  afp: string;
  pensionUF: string;
  pensionBruta: string;
  descuentoSalud: string;
  pensionLiquida: string;
  comision?: string;
}

export interface ResultadoCompania {
  compania: string;
  pensionUF: string;
  pensionBruta: string;
  descuentoSalud: string;
  pensionLiquida: string;
}

export interface RentaVitaliciaAumentada {
  compania: string;
  pensionAumentadaUF: string;
  pensionAumentadaPesos: string;
  descuentoSalud: string;
  pensionLiquidaAumentada: string;
  pensionBaseUF: string;
}

export interface ModalidadPension {
  tipo: 'retiro_programado' | 'renta_vitalicia_simple' | 'renta_vitalicia_garantizada' | 'renta_vitalicia_aumentada' | 'pension_referencia_garantizada' | 'otra';
  nombre: string;
  mesesGarantizados?: number;
  mesesAumento?: number;
  resultados: ResultadoAFP[] | ResultadoCompania[] | RentaVitaliciaAumentada[];
}

export interface InformePrevisional {
  seccion1: {
    antecedentesAfiliado: Afiliado;
    certificadoSaldo: CertificadoSaldo;
  };
  seccion2: {
    beneficiarios: Beneficiario[];
  };
  seccion3: {
    tipoPension: string;
    saldoPensionUF: string;
    modalidadesSolicitadas: string[];
  };
  seccion4: {
    gestiones: string[];
  };
  seccion5: {
    modalidades: ModalidadPension[];
  };
  seccion6: {
    recomendacion: string;
  };
}

export interface DocumentUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
  uploadedAt: Date;
  analyzed: boolean;
}

export interface AppState {
  // Documents
  documents: DocumentUpload[];
  addDocument: (doc: DocumentUpload) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;

  // Analysis
  analysisResult: string;
  setAnalysisResult: (result: string) => void;

  // Report
  currentReport: string;
  setCurrentReport: (report: string) => void;
  recommendation: string;
  setRecommendation: (rec: string) => void;

  // UI State
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;

  // Contract
  contractType: 'vejez_invalidez' | 'sobrevivencia';
  setContractType: (type: 'vejez_invalidez' | 'sobrevivencia') => void;
  contractData: ContractData;
  setContractData: (data: ContractData) => void;

  // Actions
  resetAll: () => void;
}

export interface ContractData {
  nombreAfiliado: string;
  rutAfiliado: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  telefono: string;
  celular: string;
  email: string;
  estadoCivil: string;
  fechaNacimiento: string;
  profesion: string;
  afpOrigen: string;
  sistemaSalud: string;
  tipoPension: string;
  fechaActual: string;
  // Sobrevivencia specific
  nombreCausante?: string;
  rutCausante?: string;
  nombreConsultante?: string;
  rutConsultante?: string;
  beneficiarios: Beneficiario[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalysisRequest {
  documents: {
    name: string;
    base64: string;
  }[];
}

export interface GenerateReportRequest {
  context: string;
  analysisResult?: string;
}

export interface ModifyReportRequest {
  report: string;
  instructions: string;
}

export interface GenerateContractRequest {
  contractType: 'vejez_invalidez' | 'sobrevivencia';
  contractData: ContractData;
}

export type PensionType = 'vejez_edad' | 'invalidez' | 'sobrevivencia';

export const PENSION_TYPES = {
  vejez_edad: 'Vejez Edad',
  invalidez: 'Invalidez',
  sobrevivencia: 'Sobrevivencia'
} as const;

export const MODALIDADES_PENSION = {
  retiro_programado: 'Retiro Programado',
  renta_vitalicia_simple: 'Renta Vitalicia Inmediata Simple',
  renta_vitalicia_garantizada_120: 'Renta Vitalicia Inmediata Garantizada 120 meses',
  renta_vitalicia_garantizada_240: 'Renta Vitalicia Inmediata Garantizada 240 meses',
  renta_vitalicia_aumentada: 'Renta Vitalicia Aumentada',
  pension_referencia_garantizada: 'Pensión de Referencia Garantizada'
} as const;
