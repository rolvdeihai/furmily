'use client';

import { useEffect, useRef } from 'react';

interface PDFTextExtractorProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

export default function PDFTextExtractor({ file, onTextExtracted, onError }: PDFTextExtractorProps) {
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const extractText = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        onTextExtracted(fullText);
      } catch (err: any) {
        onError(err.message || 'Gagal mengekstrak PDF');
      } finally {
        isProcessing.current = false;
      }
    };

    extractText();
  }, [file, onTextExtracted, onError]);

  return null;
}