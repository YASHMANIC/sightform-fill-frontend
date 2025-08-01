import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  progress: number;
  isVisible: boolean;
}

export const ProgressIndicator = ({ progress, isVisible }: ProgressIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="w-full space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-sm">
        <span>Processing...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
      <div className="sr-only" aria-live="polite">
        Processing progress: {Math.round(progress)} percent complete
      </div>
    </div>
  );
};