import { useState, useRef } from 'react';
import { Upload, FileText, Image, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileProcessed: (extractedText: string, filename: string) => void;
  onProgress: (progress: number) => void;
}

export const FileUpload = ({ onFileProcessed, onProgress }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    onProgress(10);
    
    try {
      let extractedText = '';
      
      if (file.type.startsWith('image/')) {
        extractedText = await processImageWithOCR(file);
      } else if (file.type === 'application/pdf') {
        extractedText = await processPDF(file);
      } else if (file.type.includes('document') || file.name.endsWith('.docx')) {
        extractedText = await processDocument(file);
      } else {
        throw new Error('Unsupported file type. Please upload an image, PDF, or Word document.');
      }

      onProgress(100);
      onFileProcessed(extractedText, file.name);
      
      toast({
        title: "Success",
        description: `Text extracted from ${file.name}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
      onProgress(0);
    }
  };

  const processImageWithOCR = async (file: File): Promise<string> => {
    const Tesseract = await import('tesseract.js');
    onProgress(30);
    
    const { data: { text } } = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            onProgress(30 + (m.progress * 60));
          }
        }
      }
    );
    
    return text;
  };

  const processPDF = async (file: File): Promise<string> => {
    try {
      // Use dynamic import for better Vite compatibility
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker path for Vite environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      
      onProgress(40);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || item.textContent || '')
          .join(' ');
        text += pageText + '\n';
        onProgress(40 + (i / pdf.numPages) * 50);
      }
      
      return text.trim();
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error('Failed to process PDF. Please try a different file or convert to image format.');
    }
  };

  const processDocument = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth');
    onProgress(50);
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    onProgress(90);
    
    return result.value;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const getFileTypeIcon = (isDragging: boolean) => {
    if (isDragging) return <Upload className="w-12 h-12" />;
    return (
      <div className="flex gap-2">
        <Image className="w-8 h-8" />
        <FileText className="w-8 h-8" />
        <FileIcon className="w-8 h-8" />
      </div>
    );
  };

  return (
    <Card 
      className={`p-8 border-2 border-dashed transition-all duration-300 ${
        isDragging 
          ? 'border-primary bg-primary/5 scale-105' 
          : 'border-muted-foreground/30 hover:border-primary/50'
      } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className="flex flex-col items-center justify-center space-y-6 min-h-[200px]"
      >
        <div className="text-primary" aria-hidden="true">
          {getFileTypeIcon(isDragging)}
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">
            {isProcessing ? 'Processing your file...' : 'Upload Document or Image'}
          </h3>
          <p className="text-muted-foreground text-lg">
            {isProcessing 
              ? 'Extracting text using OCR and document processing'
              : 'Drag and drop or click to select files. Supports images, PDFs, and Word documents.'
            }
          </p>
        </div>

        {!isProcessing && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="btn-accessible"
            aria-describedby="file-upload-description"
          >
            <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
            Choose File
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Select file to upload"
          id="file-upload"
        />

        <div id="file-upload-description" className="sr-only">
          Upload an image file for OCR text extraction, a PDF document, or a Word document. 
          Supported formats include JPG, PNG, PDF, DOC, and DOCX files.
        </div>
      </div>
    </Card>
  );
};