import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentUpload, ContractData, Beneficiario } from '@/types';

interface AppState {
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

const defaultContractData: ContractData = {
  nombreAfiliado: '',
  rutAfiliado: '',
  direccion: '',
  comuna: '',
  ciudad: '',
  telefono: '',
  celular: '',
  email: '',
  estadoCivil: '',
  fechaNacimiento: '',
  profesion: '',
  afpOrigen: '',
  sistemaSalud: '',
  tipoPension: '',
  fechaActual: new Date().toLocaleDateString('es-CL'),
  beneficiarios: []
};

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      // Documents
      documents: [],
      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc]
        })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id)
        })),
      clearDocuments: () => set({ documents: [] }),

      // Analysis
      analysisResult: '',
      setAnalysisResult: (result) => set({ analysisResult: result }),

      // Report
      currentReport: '',
      setCurrentReport: (report) => set({ currentReport: report }),
      recommendation: '',
      setRecommendation: (rec) => set({ recommendation: rec }),

      // UI State
      currentStep: 0,
      setCurrentStep: (step) => set({ currentStep: step }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      loadingMessage: '',
      setLoadingMessage: (message) => set({ loadingMessage: message }),

      // Contract
      contractType: 'vejez_invalidez',
      setContractType: (type) => set({ contractType: type }),
      contractData: defaultContractData,
      setContractData: (data) => set({ contractData: data }),

      // Actions
      resetAll: () =>
        set({
          documents: [],
          analysisResult: '',
          currentReport: '',
          recommendation: '',
          currentStep: 0,
          isLoading: false,
          loadingMessage: '',
          contractType: 'vejez_invalidez',
          contractData: defaultContractData
        })
    }),
    {
      name: 'pension-advisory-storage',
      partialize: (state) => ({
        documents: state.documents,
        currentReport: state.currentReport,
        contractData: state.contractData,
        contractType: state.contractType
      })
    }
  )
);

// Utility function to extract data from report for contract
export function extractContractDataFromReport(report: string): ContractData {
  const extractField = (pattern: RegExp): string => {
    const match = report.match(pattern);
    return match ? match[1].trim() : '';
  };

  const extractRUT = (text: string): string => {
    const rutMatch = text.match(/\b(\d{1,2}\.\d{3}\.\d{3}-[\dkK])\b/);
    return rutMatch ? rutMatch[1] : '';
  };

  const data: ContractData = {
    nombreAfiliado: extractField(/\*\*Nombre Completo:?\*\*\s*(.+)/i),
    rutAfiliado: extractField(/\*\*RUT:?\*\*\s*(.+)/i) || extractRUT(report),
    direccion: extractField(/\*\*(?:Direcci[óo]n|Domicilio):?\*\*\s*(.+)/i),
    comuna: extractField(/\*\*Comuna:?\*\*\s*(.+)/i),
    ciudad: extractField(/\*\*Ciudad:?\*\*\s*(.+)/i),
    telefono: extractField(/\*\*Tel[ée]fono:?\*\*\s*(.+)/i),
    celular: extractField(/\*\*Celular:?\*\*\s*(.+)/i),
    email: extractField(/\*\*Correo.*?:?\*\*\s*(.+)/i),
    estadoCivil: extractField(/\*\*Estado Civil:?\*\*\s*(.+)/i),
    fechaNacimiento: extractField(/\*\*Fecha de Nacimiento:?\*\*\s*(.+)/i),
    profesion: extractField(/\*\*(?:Oficio|Profesi[óo]n|Ocupaci[óo]n):?\*\*\s*(.+)/i),
    afpOrigen: extractField(/\*\*AFP de Origen:?\*\*\s*(.+)/i),
    sistemaSalud: extractField(/\*\*(?:Instituci[óo]n de Salud|Sistema de Salud):?\*\*\s*(.+)/i),
    tipoPension: extractField(/\*\*Tipo de Pensi[óo]n Solicitada:?\*\*\s*(.+)/i),
    fechaActual: new Date().toLocaleDateString('es-CL'),
    beneficiarios: extractBeneficiariesFromReport(report)
  };

  return data;
}

function extractBeneficiariesFromReport(report: string): Beneficiario[] {
  const beneficiaries: Beneficiario[] = [];
  
  // Find the beneficiaries section
  const sectionMatch = report.match(/Antecedentes del beneficiario/i);
  if (!sectionMatch) return beneficiaries;

  const startIndex = sectionMatch.index! + sectionMatch[0].length;
  const sectionText = report.slice(startIndex);
  
  // Find the table
  const lines = sectionText.split('\n');
  const tableLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const stripped = line.trim();
    if (stripped.startsWith('|') && stripped.endsWith('|')) {
      if (!inTable && stripped.includes('---')) continue;
      inTable = true;
      tableLines.push(stripped);
    } else if (inTable && stripped === '') {
      break;
    }
  }

  // Skip header and separator, process data rows
  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i].split('|').map(c => c.trim()).filter(c => c);
    if (cells.length >= 3) {
      beneficiaries.push({
        nombre: cells[0] || '',
        rut: cells[1] || '',
        parentesco: cells[2] || '',
        sexo: cells[3] || '',
        invalidez: cells[4] || '',
        fechaNacimiento: cells[5] || ''
      });
    }
  }

  return beneficiaries;
}
