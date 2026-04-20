"use client";

import React, { useState } from 'react';
import { ZodSchema } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { UploadCloud, Loader2 } from 'lucide-react';

interface JsonUploaderProps {
  mode: 'brain-ring';
  schema: ZodSchema<any>;
  onSuccess?: () => void;
}

export function JsonUploader({ mode, schema, onSuccess }: JsonUploaderProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setErrors([]);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        
        const parseResult = schema.safeParse(json);
        if (!parseResult.success) {
          const formattedErrors = parseResult.error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`);
          setErrors(formattedErrors);
          return;
        }

        setIsUploading(true);
        
        const res = await api.post('/api/admin/questions/bulk', { mode, data: parseResult.data });

        if (res.data.success) {
          toast.success(`${mode} questions uploaded successfully!`);
          if (onSuccess) onSuccess();
        } else {
          throw new Error('Upload failed from server response');
        }
      } catch (err: any) {
        setErrors([err.message || 'An unexpected error occurred during parsing or upload']);
        toast.error('Upload failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      processFile(file);
    } else {
      toast.error("Please drop a valid .json file");
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center
          ${isDragging ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input 
          type="file" 
          accept=".json" 
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="rounded-full bg-neutral-900 py-3 px-3 mb-4 border border-neutral-800 text-neutral-400 group-hover:text-white transition-colors">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">
          {isUploading ? 'Processing Upload...' : 'Upload Questions JSON'}
        </h3>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto">
          Drag and drop your JSON file here, or click to select from your device.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-950/30 text-red-500 p-4 rounded-lg text-sm border border-red-900/50">
          <p className="font-semibold mb-2">Validation Errors:</p>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-red-400">{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
