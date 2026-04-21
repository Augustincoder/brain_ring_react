"use client";

import React, { useState } from 'react';
import { ZodSchema } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Loader2, Check, X, Info } from 'lucide-react';

interface JsonUploaderProps {
  mode: 'brain-ring';
  schema: ZodSchema<any>;
  onSuccess?: () => void;
}

export function JsonUploader({ mode, schema, onSuccess }: JsonUploaderProps) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any[] | null>(null);

  const processFile = async (file: File) => {
    setErrors([]);
    setPreviewData(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        
        const parseResult = schema.safeParse(json);
        if (!parseResult.success) {
          const formattedErrors = parseResult.error.errors.map((err: any) => {
            const path = err.path.join('.');
            return `${path ? 'Item ' + path : 'File'}: ${err.message}`;
          });
          setErrors(formattedErrors);
          return;
        }

        setPreviewData(parseResult.data);
        toast.info(`${parseResult.data.length} questions ready for preview`);
      } catch (err: any) {
        setErrors([err.message || 'An unexpected error occurred during parsing']);
        toast.error('Parsing failed');
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!previewData) return;
    
    try {
      setIsUploading(true);
      const res = await api.post('/api/admin/questions/bulk', previewData);

      if (res.data.success) {
        toast.success(`${previewData.length} questions added to the system!`);
        setPreviewData(null);
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Upload failed from server response');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setErrors([]);
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

  if (previewData) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Import Preview</h3>
              <p className="text-xs text-neutral-400">{previewData.length} questions detected and validated.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearPreview} disabled={isUploading} className="text-neutral-400 hover:text-white">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={isUploading} className="bg-white text-black hover:bg-neutral-200">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              {isUploading ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/50 backdrop-blur-sm max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-neutral-900 sticky top-0 z-10">
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400">Question</TableHead>
                <TableHead className="text-neutral-400">Answer</TableHead>
                <TableHead className="text-neutral-400 w-24">Category</TableHead>
                <TableHead className="text-neutral-400 text-center w-24">Difficulty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((q, i) => (
                <TableRow key={i} className="border-neutral-800 hover:bg-neutral-900/30 transition-colors">
                  <TableCell className="text-neutral-200 font-medium max-w-xs truncate" title={q.questionText}>
                    {q.questionText}
                  </TableCell>
                  <TableCell className="text-neutral-400 max-w-[200px] truncate" title={q.correctAnswer}>
                    {q.correctAnswer}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-neutral-800 bg-neutral-900/50">
                      {q.category || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="capitalize text-[10px] bg-neutral-800 text-neutral-400">
                      {q.difficulty || 'medium'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 flex flex-col items-center justify-center
          ${isDragging ? 'border-white bg-neutral-900 scale-[1.01]' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/50'}
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
        
        <div className="rounded-2xl bg-neutral-900 py-4 px-4 mb-6 border border-neutral-800 text-neutral-400 shadow-inner group-hover:text-white transition-colors">
          <UploadCloud className="h-8 w-8" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Import Questions
        </h3>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
          Drag and drop your JSON file here, or click to browse. We'll show you a preview before saving.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-950/20 text-red-500 p-6 rounded-xl text-sm border border-red-900/40 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <X className="h-5 w-5 bg-red-500 text-white rounded-full p-1" />
            <p className="font-bold text-base">Validation Failed</p>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            {errors.map((err, i) => (
              <li key={i} className="text-red-400/90 font-medium">{err}</li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={() => setErrors([])} className="mt-4 text-red-400 hover:text-red-300 hover:bg-red-950/40">
            Clear Errors
          </Button>
        </div>
      )}
    </div>
  );
}
