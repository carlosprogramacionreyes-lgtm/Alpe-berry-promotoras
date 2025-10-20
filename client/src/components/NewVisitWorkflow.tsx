import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Upload, AlertTriangle, X } from 'lucide-react';
import type { Product, Store } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';

interface NewVisitWorkflowProps {
  store: Store;
  products: Product[];
  onCancel: () => void;
  onComplete: () => void;
}

type WorkflowStep = 'product-selection' | 'availability' | 'quality' | 'prices' | 'incidents';

const stepLabels = {
  'product-selection': 'Selección',
  'availability': 'Disponibilidad',
  'quality': 'Calidad',
  'prices': 'Precios',
  'incidents': 'Incidencias'
};

const stepNumbers = {
  'product-selection': 1,
  'availability': 2,
  'quality': 3,
  'prices': 4,
  'incidents': 5
};

export default function NewVisitWorkflow({ store, products, onCancel, onComplete }: NewVisitWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('product-selection');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form data
  const [formData, setFormData] = useState({
    // Step 2: Availability
    stock: '',
    location: '',
    displayCondition: '',
    areaPhotoUrl: '',

    // Step 3: Quality
    freshness: 3,
    appearance: '',
    packagingCondition: '',
    expirationDate: '',
    temperature: '',
    qualityPhotoUrl: '',

    // Step 4: Prices
    currentPrice: '',
    suggestedPrice: '',
    activePromotions: [] as string[],
    promotionDescription: '',
    popMaterialPresent: false,
    popMaterialPhotoUrl: '',
    pricePhotoUrl: '',

    // Step 5: Incidents
    incidentTypes: [] as string[],
    severity: '',
    actionRequired: '',
    evidencePhotoUrl: '',
    detectedCompetition: ''
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any;
    return (IconComponent && typeof IconComponent === 'function') ? IconComponent : Icons.Circle;
  };

  const handleNext = () => {
    const steps: WorkflowStep[] = ['product-selection', 'availability', 'quality', 'prices', 'incidents'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: WorkflowStep[] = ['product-selection', 'availability', 'quality', 'prices', 'incidents'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/evaluations', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: 'Evaluación completada',
        description: '✅ Evaluación completada y guardada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations'] });
      onComplete();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación',
        variant: 'destructive'
      });
    }
  });

  const handleComplete = () => {
    console.log('handleComplete called', { selectedProductId, formData });
    
    if (!selectedProductId) {
      console.log('No product selected, returning');
      return;
    }

    const evaluationData = {
      storeId: store.id,
      productId: selectedProductId,
      status: 'completed',
      currentStep: 5,
      stock: parseInt(formData.stock) || 0,
      location: formData.location,
      displayCondition: formData.displayCondition,
      areaPhotoUrl: formData.areaPhotoUrl,
      freshness: formData.freshness,
      appearance: formData.appearance,
      packagingCondition: formData.packagingCondition,
      qualityPhotoUrl: formData.qualityPhotoUrl,
      currentPrice: parseFloat(formData.currentPrice) || 0,
      suggestedPrice: parseFloat(formData.suggestedPrice) || 0,
      activePromotions: formData.activePromotions,
      pricePhotoUrl: formData.pricePhotoUrl,
      hasIncidents: formData.incidentTypes.length > 0,
      completedAt: new Date().toISOString()
    };

    console.log('Submitting evaluation:', evaluationData);
    saveMutation.mutate(evaluationData);
  };

  const hasNoIncidents = formData.incidentTypes.includes('✅ No incidents / Everything OK');
  const hasRealIncidents = formData.incidentTypes.some(i => i !== '✅ No incidents / Everything OK');

  const canProceed = () => {
    switch (currentStep) {
      case 'product-selection':
        return !!selectedProductId;
      case 'availability':
        return !!formData.stock && !!formData.location && !!formData.displayCondition;
      case 'quality':
        return !!formData.appearance && !!formData.packagingCondition;
      case 'prices':
        return !!formData.currentPrice;
      case 'incidents':
        // If "No incidents" is selected, always allow completion
        if (hasNoIncidents) return true;
        // If other incidents are selected, require severity and action
        if (hasRealIncidents) return !!formData.severity && !!formData.actionRequired;
        // If nothing selected, allow completion (incidents are optional)
        return true;
      default:
        return true;
    }
  };

  const isExpirationNear = (date: string): boolean => {
    if (!date) return false;
    const expDate = new Date(date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  };

  const priceVariation = formData.currentPrice && formData.suggestedPrice
    ? ((parseFloat(formData.currentPrice) - parseFloat(formData.suggestedPrice)) / parseFloat(formData.suggestedPrice) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Visita en Curso</h1>
          <p className="text-sm text-muted-foreground">
            {store.name} • {store.city} • {new Date().toLocaleDateString('es-MX')}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-workflow">
          Cancelar
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso de la visita</span>
          <span className="font-medium text-foreground">Paso {stepNumbers[currentStep]} de 5</span>
        </div>
        <div className="flex gap-2">
          {Object.entries(stepLabels).map(([step, label]) => (
            <div key={step} className="flex-1 space-y-1">
              <div 
                className={`h-2 rounded-full ${
                  stepNumbers[step as WorkflowStep] < stepNumbers[currentStep] 
                    ? 'bg-green-500' 
                    : stepNumbers[step as WorkflowStep] === stepNumbers[currentStep]
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
              <p className={`text-xs text-center ${
                stepNumbers[step as WorkflowStep] === stepNumbers[currentStep]
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {currentStep === 'product-selection' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecciona el tipo de berry a evaluar</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Elige uno de los siguientes productos para iniciar la evaluación
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.filter(p => p.active).map((product) => {
                const Icon = getIcon(product.icon);
                const isSelected = selectedProductId === product.id;
                
                return (
                  <Card
                    key={product.id}
                    className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: isSelected ? product.color : `${product.color}15` }}
                    onClick={() => setSelectedProductId(product.id)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div 
                        className="p-3 rounded-full"
                        style={{ 
                          backgroundColor: product.color,
                          opacity: isSelected ? 1 : 0.2
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Berry Fresh</p>
                      </div>
                      {isSelected && (
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          style={{ backgroundColor: product.color }}
                          data-testid={`button-start-evaluation-${product.id}`}
                        >
                          Iniciar Evaluación
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Availability */}
      {currentStep === 'availability' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paso 1/4: Disponibilidad</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa la información sobre la disponibilidad del producto
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock: Cantidad disponible *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="30"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                data-testid="input-stock"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location" data-testid="select-location">
                  <SelectValue placeholder="Exhibidor principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exhibidor principal">Exhibidor principal</SelectItem>
                  <SelectItem value="Área refrigerada">Área refrigerada</SelectItem>
                  <SelectItem value="Anaquel secundario">Anaquel secundario</SelectItem>
                  <SelectItem value="Bodega">Bodega</SelectItem>
                  <SelectItem value="Góndola">Góndola</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayCondition">Estado del display *</Label>
              <Select
                value={formData.displayCondition}
                onValueChange={(value) => setFormData({ ...formData, displayCondition: value })}
              >
                <SelectTrigger id="displayCondition" data-testid="select-display-condition">
                  <SelectValue placeholder="Bueno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Bueno">Bueno</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Malo">Malo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaPhoto">Foto del área</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center hover-elevate cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">URL de la foto o arrastrar archivo (opcional)</p>
                <Input
                  id="areaPhoto"
                  type="text"
                  placeholder="https://... o cargar archivo"
                  className="mt-2"
                  value={formData.areaPhotoUrl}
                  onChange={(e) => setFormData({ ...formData, areaPhotoUrl: e.target.value })}
                  data-testid="input-area-photo"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Quality */}
      {currentStep === 'quality' && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paso 2/4: Evaluación de Calidad</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Evalúa la calidad del producto
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Frescura (1-5) *</Label>
                <Badge variant="secondary" className="text-base font-bold">
                  {formData.freshness}
                </Badge>
              </div>
              <Slider
                value={[formData.freshness]}
                onValueChange={(value) => setFormData({ ...formData, freshness: value[0] })}
                min={1}
                max={5}
                step={1}
                className="w-full"
                data-testid="slider-freshness"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muy bajo</span>
                <span>Excelente</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appearance">Apariencia *</Label>
              <Select
                value={formData.appearance}
                onValueChange={(value) => setFormData({ ...formData, appearance: value })}
              >
                <SelectTrigger id="appearance" data-testid="select-appearance">
                  <SelectValue placeholder="Regular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Buena">Buena</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Mala">Mala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packagingCondition">Estado del empaque *</Label>
              <Select
                value={formData.packagingCondition}
                onValueChange={(value) => setFormData({ ...formData, packagingCondition: value })}
              >
                <SelectTrigger id="packagingCondition" data-testid="select-packaging-condition">
                  <SelectValue placeholder="Dañado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Intacto">Intacto</SelectItem>
                  <SelectItem value="Leve desgaste">Leve desgaste</SelectItem>
                  <SelectItem value="Dañado">Dañado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Fecha de caducidad *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                data-testid="input-expiration-date"
              />
              {isExpirationNear(formData.expirationDate) && (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ Producto próximo a vencer
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                placeholder="5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                data-testid="input-temperature"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityPhoto">Foto del producto (hasta 3) *</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center hover-elevate cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">URLs de fotos separadas por coma</p>
                <Input
                  id="qualityPhoto"
                  type="text"
                  placeholder="https://..."
                  className="mt-2"
                  value={formData.qualityPhotoUrl}
                  onChange={(e) => setFormData({ ...formData, qualityPhotoUrl: e.target.value })}
                  data-testid="input-quality-photo"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Clic en arrancar o adjuntar archivo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Prices */}
      {currentStep === 'prices' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paso 3/4: Precios y Promociones</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Registra información de precios y promociones
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Precio actual *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder="90"
                  className="pl-7"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  data-testid="input-current-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedPrice">Precio sugerido/competencia</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="suggestedPrice"
                  type="number"
                  step="0.01"
                  placeholder="100"
                  className="pl-7"
                  value={formData.suggestedPrice}
                  onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                  data-testid="input-suggested-price"
                />
              </div>
            </div>

            {formData.currentPrice && formData.suggestedPrice && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm font-medium">
                  Variación: <span className={parseFloat(priceVariation) < 0 ? 'text-red-600' : 'text-green-600'}>
                    {priceVariation}%
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Promociones activas</Label>
              <div className="space-y-2">
                {['2x1', 'Descuento %', '3x2', 'Gratis', 'Ninguna'].map((promo) => (
                  <div key={promo} className="flex items-center gap-2">
                    <Checkbox
                      id={`promo-${promo}`}
                      checked={formData.activePromotions.includes(promo)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ 
                            ...formData, 
                            activePromotions: [...formData.activePromotions, promo] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            activePromotions: formData.activePromotions.filter(p => p !== promo) 
                          });
                        }
                      }}
                      data-testid={`checkbox-promo-${promo}`}
                    />
                    <Label htmlFor={`promo-${promo}`} className="cursor-pointer">{promo}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionDescription">Descripción de promoción</Label>
              <Textarea
                id="promotionDescription"
                placeholder="Describe la promoción..."
                value={formData.promotionDescription}
                onChange={(e) => setFormData({ ...formData, promotionDescription: e.target.value })}
                data-testid="textarea-promotion-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePhoto">Foto de etiqueta de precio (opcional)</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center hover-elevate cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <Input
                  id="pricePhoto"
                  type="text"
                  placeholder="URL de la foto"
                  className="mt-2"
                  value={formData.pricePhotoUrl}
                  onChange={(e) => setFormData({ ...formData, pricePhotoUrl: e.target.value })}
                  data-testid="input-price-photo"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Incidents */}
      {currentStep === 'incidents' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paso 4/4: Incidencias</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Registra cualquier incidencia encontrada (opcional)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de incidencia</Label>
              <div className="space-y-2">
                {[
                  'Producto vencido',
                  'Empaque dañado',
                  'Promoción faltante',
                  'Competencia agresiva',
                  'Precio incorrecto',
                  'Sin stock',
                  'Otro',
                  '✅ No incidents / Everything OK'
                ].map((incident) => (
                  <div key={incident} className="flex items-center gap-2">
                    <Checkbox
                      id={`incident-${incident}`}
                      checked={formData.incidentTypes.includes(incident)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ 
                            ...formData, 
                            incidentTypes: [...formData.incidentTypes, incident] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            incidentTypes: formData.incidentTypes.filter(i => i !== incident) 
                          });
                        }
                      }}
                      data-testid={`checkbox-incident-${incident}`}
                    />
                    <Label htmlFor={`incident-${incident}`} className="cursor-pointer">
                      {incident}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {hasRealIncidents && !hasNoIncidents && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="severity">Nivel de severidad *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger id="severity" data-testid="select-severity">
                      <SelectValue placeholder="Baja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionRequired">Acción requerida *</Label>
                  <Textarea
                    id="actionRequired"
                    placeholder="Describe la solución urgente..."
                    value={formData.actionRequired}
                    onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                    data-testid="textarea-action-required"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidencePhoto">Fotos de evidencia (hasta 4)</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center hover-elevate cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="evidencePhoto"
                      type="text"
                      placeholder="URLs separadas por coma"
                      className="mt-2"
                      value={formData.evidencePhotoUrl}
                      onChange={(e) => setFormData({ ...formData, evidencePhotoUrl: e.target.value })}
                      data-testid="input-evidence-photo"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="competition">Competencia detectada (opcional)</Label>
              <Textarea
                id="competition"
                placeholder="Ej: 3 con promoción 2x1"
                value={formData.detectedCompetition}
                onChange={(e) => setFormData({ ...formData, detectedCompetition: e.target.value })}
                data-testid="textarea-competition"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 'product-selection'}
          className="flex-1"
          data-testid="button-previous"
        >
          Volver
        </Button>
        {currentStep !== 'incidents' ? (
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
            data-testid="button-next"
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            onClick={handleComplete}
            disabled={!canProceed() || saveMutation.isPending}
            className="flex-1"
            data-testid="button-complete"
          >
            {saveMutation.isPending ? 'Guardando...' : 'Completar'}
          </Button>
        )}
      </div>
    </div>
  );
}
