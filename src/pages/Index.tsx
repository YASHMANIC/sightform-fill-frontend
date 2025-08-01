import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AccessibleForm } from '@/components/AccessibleForm';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Eye, FileText, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '@/AuthContext'; 
import { useTheme } from '@/components/ThemeProvider';
import Loading from '@/components/Loading';

const Index = () => {
  const [extractedText, setExtractedText] = useState('');
  const [filename, setFilename] = useState('');
  const [progress, setProgress] = useState(0);
  const[loading,setLoading] = useState(false);
  const[success,setSuccess] = useState("")
  const[error,setError] = useState("")
  const { theme, setTheme } = useTheme();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleFileProcessed = (text: string, name: string) => {
    setExtractedText(text);
    setFilename(name);
  };

  const handleProgress = (progressValue: number) => {
    setProgress(progressValue);
  };

  const onClick = async () => {
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Optional: Inform the backend if you have a token blacklist system
    const token = localStorage.getItem('token');
    if (token && url) {
      await axios.post(`${url}users/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear client-side token and auth state
    localStorage.removeItem('token');
    setUser(null);
    toast.success("Logged out successfully");
    setSuccess("Logged out successfully");
    navigate("/signin");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || "Something went wrong";
      toast.error(message);
      setError(message);
    } else {
      toast.error("Unexpected error");
      setError("Unexpected error");
    }
  } finally {
    setLoading(false);
  }
};

  return loading ? (<Loading/>) : (
    <div className="min-h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4 gap-3">
          <ThemeToggle />
          <div onClick={onClick}>
            <Button className='hover:bg-red-400 ' variant='destructive' disabled={loading}>
              Logout
            </Button>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-10 h-10 text-primary" aria-hidden="true" />
            <h1 className="text-4xl font-bold">Easy Fill</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Accessible form filling assistant for visually impaired users
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>OCR Text Extraction</span>
            </div>
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Screen Reader Optimized</span>
            </div>
          </div>
        </header>

        <main id="main-content" className="space-y-8">
          {/* Instructions */}
          <section aria-labelledby="instructions-heading">
            <h2 id="instructions-heading" className="text-2xl font-semibold mb-4">
              How to Use Easy Fill
            </h2>
            <div className="bg-muted p-6 rounded-lg space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-lg">
                <li>Upload an image, PDF, or Word document containing form fields</li>
                <li>Wait for the text extraction and form field detection to complete</li>
                <li>Review and edit the automatically populated form fields</li>
                <li>Use the read-aloud feature to hear your form data</li>
                <li>Copy individual fields or download all form data</li>
              </ol>
              <p className="text-muted-foreground mt-4">
                <strong>Accessibility features:</strong> Full keyboard navigation, screen reader support, 
                high contrast design, text-to-speech, and large clickable areas.
              </p>
            </div>
          </section>

          {/* File Upload */}
          <section aria-labelledby="upload-heading">
            <h2 id="upload-heading" className="text-2xl font-semibold mb-4">
              Upload Document
            </h2>
            <FileUpload 
              onFileProcessed={handleFileProcessed}
              onProgress={handleProgress}
            />
          </section>

          {/* Progress Indicator */}
          <ProgressIndicator 
            progress={progress} 
            isVisible={progress > 0 && progress < 100} 
          />
  
          {/* Form Results */}
          {extractedText && (
            <section aria-labelledby="results-heading">
              <h2 id="results-heading" className="text-2xl font-semibold mb-4">
                Extracted Form Data
              </h2>
              <AccessibleForm 
                extractedText={extractedText} 
                filename={filename}
              />
            </section>
          )}

          {/* Help Section */}
          <section aria-labelledby="help-heading" className="mt-12">
            <h2 id="help-heading" className="text-2xl font-semibold mb-4">
              Accessibility Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Keyboard Navigation</h3>
                <ul className="space-y-2">
                  <li><kbd className="bg-muted px-2 py-1 rounded">Tab</kbd> - Navigate between elements</li>
                  <li><kbd className="bg-muted px-2 py-1 rounded">Enter</kbd> - Activate buttons</li>
                  <li><kbd className="bg-muted px-2 py-1 rounded">Space</kbd> - Toggle buttons</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Audio Features</h3>
                <ul className="space-y-2">
                  <li>Text-to-speech for form fields</li>
                  <li>Audio announcements for actions</li>
                  <li>Screen reader compatibility</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground">
          <p>Easy Fill - Making form filling accessible for everyone</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
