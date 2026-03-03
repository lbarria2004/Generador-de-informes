'use client';

import { Check, FileText, FileSearch, FileSignature, Download, Sparkles } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 0,
    title: 'Cargar',
    description: 'Sube los PDFs del cliente',
    icon: FileText,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 1,
    title: 'Analizar',
    description: 'IA extrae los datos',
    icon: FileSearch,
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 2,
    title: 'Informe',
    description: 'Revisa y modifica',
    icon: FileSignature,
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 3,
    title: 'Exportar',
    description: 'Descarga o contrato',
    icon: Download,
    color: 'from-emerald-500 to-emerald-600'
  }
];

export function ProgressStepper() {
  const { currentStep, documents, currentReport } = useAppState();

  // Determine the actual step based on state
  const actualStep = documents.length === 0 ? 0 : 
                     !currentReport ? 1 : 
                     currentStep;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background progress line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full" />
        
        {/* Active progress line */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(actualStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < actualStep;
          const isCurrent = index === actualStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none relative z-10">
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step circle */}
                <motion.div
                  className={`
                    relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl
                    transition-all duration-500 ease-out shadow-lg
                    ${isCompleted 
                      ? `bg-gradient-to-br ${step.color} text-white shadow-primary/25` 
                      : isCurrent 
                        ? `bg-gradient-to-br ${step.color} text-white shadow-primary/25 ring-4 ring-primary/20` 
                        : 'bg-card text-muted-foreground border border-border'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-6 w-6" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}

                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-30 blur-xl`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Step info */}
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressStepperCompact() {
  const { currentStep, documents, currentReport } = useAppState();
  const actualStep = documents.length === 0 ? 0 : 
                     !currentReport ? 1 : 
                     currentStep;

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < actualStep;
        const isCurrent = index === actualStep;

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-300
                ${isCompleted || isCurrent 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}
              whileHover={{ scale: 1.1 }}
              title={step.title}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
