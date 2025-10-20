import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BerryCard from '@/components/BerryCard';
import ProgressSteps from '@/components/ProgressSteps';
import { Grape, Apple, Cherry, MapPin, Search, Plus, Calendar, Filter } from 'lucide-react';

export default function Visits() {
  const [viewMode, setViewMode] = useState<'list' | 'selector' | 'workflow'>('list');
  const [selectedBerry, setSelectedBerry] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const visits = [
    {
      id: 1,
      store: 'comer nor test',
      product: 'Espinaca Baby',
      date: '13/10/2025',
      time: '14:54',
      status: 'Completada',
      quality: '3.0/5'
    }
  ];

  const stores = [
    { id: 1, name: 'comer nor test', address: 'Monterrey', zone: 'Norte' },
    { id: 2, name: 'La comer Nor', address: 'Monterrey', zone: 'Norte' }
  ];

  const steps = ['Producto', 'Disponibilidad', 'Calidad', 'Precios', 'Incidencias'];

  if (viewMode === 'workflow') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Nueva Evaluación</h1>
            <p className="text-sm text-muted-foreground">comer nor test • Monterrey • 19 oct 2025</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')} data-testid="button-cancel-workflow">
            Cancelar
          </Button>
        </div>

        <ProgressSteps currentStep={currentStep} totalSteps={5} steps={steps} />

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecciona el Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <BerryCard 
                  name="Espinaca Baby" 
                  icon={Grape}
                  color="hsl(142, 71%, 45%)"
                  selected={selectedBerry === 'espinaca'}
                  onClick={() => setSelectedBerry('espinaca')}
                />
                <BerryCard 
                  name="Arándano" 
                  icon={Apple}
                  color="hsl(217, 91%, 60%)"
                  selected={selectedBerry === 'arandano'}
                  onClick={() => setSelectedBerry('arandano')}
                />
                <BerryCard 
                  name="Frambuesa" 
                  icon={Cherry}
                  color="hsl(340, 82%, 52%)"
                  selected={selectedBerry === 'frambuesa'}
                  onClick={() => setSelectedBerry('frambuesa')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep > 1 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Paso {currentStep}: {steps[currentStep - 1]}</p>
              <p className="text-center text-sm text-muted-foreground mt-2">Contenido del formulario de evaluación</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            data-testid="button-prev-step"
          >
            Anterior
          </Button>
          <Button 
            onClick={() => {
              if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
              } else {
                setViewMode('list');
                setCurrentStep(1);
                setSelectedBerry(null);
              }
            }}
            disabled={currentStep === 1 && !selectedBerry}
            data-testid="button-next-step"
          >
            {currentStep === 5 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'selector') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Selecciona la Tienda</h1>
            <p className="text-sm text-muted-foreground">Elige la tienda donde realizarás la evaluación</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')} data-testid="button-back-to-list">
            Volver
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar tienda..." className="pl-10" data-testid="input-search-store" />
        </div>

        <div className="grid gap-3">
          {stores.map((store) => (
            <Card key={store.id} className="hover-elevate cursor-pointer" onClick={() => setViewMode('workflow')} data-testid={`card-store-${store.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{store.name}</p>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">Zona {store.zone}</Badge>
                    </div>
                  </div>
                  <Button data-testid={`button-start-visit-${store.id}`}>Iniciar Visita</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mis Visitas</h1>
          <p className="text-sm text-muted-foreground">Historial y pendientes</p>
        </div>
        <Button className="gap-2" onClick={() => setViewMode('selector')} data-testid="button-new-evaluation">
          <Plus className="w-4 h-4" />
          Nueva Evaluación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rango de fechas" className="pl-10" data-testid="input-date-filter" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tienda" className="pl-10" data-testid="input-store-filter" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Producto" className="pl-10" data-testid="input-product-filter" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {visits.map((visit) => (
          <Card key={visit.id} className="hover-elevate" data-testid={`card-visit-${visit.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{visit.store}</h3>
                    <Badge className="bg-chart-2 text-white">{visit.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{visit.product}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {visit.date}
                    </span>
                    <span>{visit.time}</span>
                    <span>Calidad: {visit.quality}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-view-visit-${visit.id}`}>
                  Ver Detalle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
