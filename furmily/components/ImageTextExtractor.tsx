'use client';

import { useEffect, useRef } from 'react';

interface ImageTextExtractorProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

export default function ImageTextExtractor({ file, onTextExtracted, onError }: ImageTextExtractorProps) {
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const extractText = async () => {
      try {
        const Tesseract = await import('tesseract.js');
        const buffer = await file.arrayBuffer();
        const { data: { text } } = await Tesseract.recognize(
          Buffer.from(buffer),
          'eng+ind',
          { logger: m => console.log(m) }
        );
        onTextExtracted(text);
      } catch (err: any) {
        onError(err.message || 'Gagal mengekstrak gambar');
      } finally {
        isProcessing.current = false;
      }
    };

    extractText();
  }, [file, onTextExtracted, onError]);

  return null;
}