'use client';

import { useEffect, useRef } from 'react';

interface DOCXTextExtractorProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

export default function DOCXTextExtractor({ file, onTextExtracted, onError }: DOCXTextExtractorProps) {
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const extractText = async () => {
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        onTextExtracted(result.value);
      } catch (err: any) {
        onError(err.message || 'Gagal mengekstrak DOCX');
      } finally {
        isProcessing.current = false;
      }
    };

    extractText();
  }, [file, onTextExtracted, onError]);

  return null;
}