'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/hooks/useAppState';
import type { DocumentUpload } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FileUploaderProps {
  onUploadComplete?: () => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { documents, addDocument } = useAppState();

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const base64 = await fileToBase64(file);
          const doc: DocumentUpload = {
            id: uuidv4(),
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
            uploadedAt: new Date(),
            analyzed: false
          };
          addDocument(doc);
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    }

    setIsProcessing(false);
    onUploadComplete?.();
  }, [addDocument, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

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
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted'}
          `}>
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isProcessing ? 'Procesando archivos...' : 'Arrastra y suelta tus PDFs aquí'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              o haz clic para seleccionar archivos
            </p>
          </div>
          
          <Badge variant="secondary" className="mt-2">
            <FileText className="h-3 w-3 mr-1" />
            Solo archivos PDF
          </Badge>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none" />
        )}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Documentos cargados ({documents.length})
          </p>
          <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
            {documents.map((doc) => (
              <DocumentItem key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentItem({ document }: { document: DocumentUpload }) {
  const { removeDocument } = useAppState();

  return (
    <Card className="group hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">{document.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(document.size)}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            removeDocument(document.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get pure base64
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
