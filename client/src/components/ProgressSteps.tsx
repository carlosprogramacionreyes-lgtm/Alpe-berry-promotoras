import { CheckCircle } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function ProgressSteps({ currentStep, totalSteps, steps }: ProgressStepsProps) {
  return (
    <div className="w-full" data-testid="progress-steps">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                isCompleted ? 'bg-chart-2 text-white' :
                isCurrent ? 'bg-primary text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              <p className={`text-xs text-center ${
                isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
