import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, VolumeX, Volume2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '@/AuthContext';


interface FormField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'date';
}

interface AccessibleFormProps {
  extractedText: string;
  filename: string;
}

export const AccessibleForm = ({ extractedText, filename }: AccessibleFormProps) => {
  const {user} = useContext(AuthContext)
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const { toast } = useToast();
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL;
    if (!url) {
      console.error("BackEnd Doesn't available");
      return;
    }
  
    if (extractedText) {
      const run = async () => {
        parseTextToFormFields(extractedText);
        announceToScreenReader(`Text extracted from ${filename}. Form fields have been automatically detected and populated.`);
        
        try {
          const response = await axios.post(`${url}files`, {
            filename,
            extractedText,
            email:user.email
          }, {
            withCredentials: true,
          });
        } catch (error) {
          console.error("Error posting to backend:", error);
        }
      };
  
      run();
    }
  }, [extractedText, filename]);
  

  const parseTextToFormFields = (text: string) => {
    const fields: FormField[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common form field patterns
    const patterns = [
      { regex: /name[:]\s*(.+)/i, label: 'Full Name', type: 'text' as const },
      { regex: /first\s*name[:]\s*(.+)/i, label: 'First Name', type: 'text' as const },
      { regex: /last\s*name[:]\s*(.+)/i, label: 'Last Name', type: 'text' as const },
      { regex: /email[:]\s*(.+)/i, label: 'Email Address', type: 'email' as const },
      { regex: /phone[:]\s*(.+)/i, label: 'Phone Number', type: 'tel' as const },
      { regex: /address[:]\s*(.+)/i, label: 'Address', type: 'textarea' as const },
      { regex: /date[:]\s*(.+)/i, label: 'Date', type: 'date' as const },
      { regex: /birth.*date[:]\s*(.+)/i, label: 'Date of Birth', type: 'date' as const },
    ];

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          fields.push({
            id: `field-${index}`,
            label: pattern.label,
            value: match[1]?.trim() || '',
            type: pattern.type
          });
          break;
        }
      }

      // Generic field detection for lines with colons
      if (!patterns.some(p => p.regex.test(line)) && line.includes(':')) {
        const [label, value] = line.split(':');
        if (label && value) {
          fields.push({
            id: `field-${index}`,
            label: label.trim(),
            value: value.trim(),
            type: 'text'
          });
        }
      }
    });

    // If no structured fields found, create a general text area
    if (fields.length === 0) {
      fields.push({
        id: 'extracted-text',
        label: 'Extracted Text',
        value: text,
        type: 'textarea'
      });
    }

    setFormFields(fields);
  };

  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  const updateField = (id: string, newValue: string) => {
    setFormFields(fields =>
      fields.map(field =>
        field.id === id ? { ...field, value: newValue } : field
      )
    );
    announceToScreenReader(`Field updated: ${formFields.find(f => f.id === id)?.label}`);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ 
        title: "Copied",
        description: `${label} copied to clipboard`,
      });
      announceToScreenReader(`${label} copied to clipboard`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadFormData = () => {
    const formData = formFields.map(field => `${field.label}: ${field.value}`).join('\n');
    const blob = new Blob([formData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-form-data-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Form data downloaded successfully",
    });
    announceToScreenReader("Form data downloaded successfully");
  };

  const clearForm = () => {
    setFormFields([]);
    announceToScreenReader("Form data cleared");
    toast({
      title: "Cleared",
      description: "Form data has been cleared",
    });
  };

  if (formFields.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold" id="form-heading">
          Extracted Form Data
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={downloadFormData}
            variant="outline"
            size="sm"
            className="btn-accessible"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={clearForm}
            variant="outline"
            size="sm"
            className="btn-accessible"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-4" role="region" aria-labelledby="form-heading">
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-lg font-medium">
              {field.label}
            </Label>
            <div className="flex gap-2">
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.id}
                  value={field.value}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="flex-1 min-h-[100px] text-lg"
                  aria-describedby={`${field.id}-description`}
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="flex-1 text-lg"
                  aria-describedby={`${field.id}-description`}
                />
              )}
              <Button
                onClick={() => copyToClipboard(field.value, field.label)}
                variant="outline"
                size="sm"
                className="btn-accessible shrink-0"
                aria-label={`Copy ${field.label} to clipboard`}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div id={`${field.id}-description`} className="sr-only">
              {field.label} field. Use Tab to navigate to the copy and read buttons.
            </div>
          </div>
        ))}
      </div>

      {/* Screen reader announcements */}
      <div 
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </Card>
  );
};