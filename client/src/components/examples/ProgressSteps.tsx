import ProgressSteps from '../ProgressSteps';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ProgressStepsExample() {
  const [currentStep, setCurrentStep] = useState(2);
  const steps = ['Producto', 'Disponibilidad', 'Calidad', 'Precios', 'Incidencias'];

  return (
    <div className="p-6 space-y-4">
      <ProgressSteps currentStep={currentStep} totalSteps={5} steps={steps} />
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        <Button 
          size="sm"
          onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
          disabled={currentStep === 5}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
