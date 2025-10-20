import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Plus, Calendar, Filter, ChevronRight, ChevronLeft, CheckCircle2, Store } from 'lucide-react';
import type { Chain, Store as StoreType, Product, User } from '@shared/schema';
import NewVisitWorkflow from '@/components/NewVisitWorkflow';

type StoreWithDistance = StoreType & {
  distance?: number;
  inRange?: boolean;
  hasCoordinates?: boolean;
  chainName?: string;
};

export default function Visits() {
  const [viewMode, setViewMode] = useState<'list' | 'chain-selector' | 'store-selector' | 'workflow'>('list');
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: authData } = useQuery<{ user: User }>({ queryKey: ['/api/auth/me'] });
  const currentUser = authData?.user;
  const isAdmin = currentUser?.role === 'admin';

  const { data: chains = [] } = useQuery<Chain[]>({ queryKey: ['/api/chains'] });
  const { data: allStores = [] } = useQuery<StoreType[]>({ queryKey: ['/api/stores'] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ['/api/products'] });

  // Get location when entering store selector
  useEffect(() => {
    if (viewMode === 'store-selector' && !userLocation && !isGettingLocation) {
      setIsGettingLocation(true);
      setLocationError(null);
      
      if (!navigator.geolocation) {
        setLocationError('Geolocalización no disponible en este navegador');
        setIsGettingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          setLocationError(`Error obteniendo ubicación: ${error.message}`);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [viewMode, userLocation, isGettingLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get stores for selected chain with distance calculations
  const storesWithDistance: StoreWithDistance[] = allStores
    .filter(store => !selectedChainId || store.chainId === selectedChainId)
    .map(store => {
      const chain = chains.find(c => c.id === store.chainId);
      const hasCoordinates = !!store.latitude && !!store.longitude;
      
      let distance: number | undefined;
      let inRange = false;

      if (hasCoordinates && userLocation) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(store.latitude as string),
          parseFloat(store.longitude as string)
        );
        inRange = distance <= (store.geofenceRadius || 100);
      }

      return {
        ...store,
        distance,
        inRange,
        hasCoordinates,
        chainName: chain?.name
      };
    })
    .sort((a, b) => {
      // Sort by distance if both have coordinates
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // Stores with coordinates come first
      if (a.hasCoordinates && !b.hasCoordinates) return -1;
      if (!a.hasCoordinates && b.hasCoordinates) return 1;
      return 0;
    });

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleStartNewVisit = () => {
    setViewMode('store-selector');
    setSelectedChainId(null);
    setSelectedStoreId(null);
    setUserLocation(null);
    setLocationError(null);
  };

  const handleChainSelect = (chainId: string) => {
    setSelectedChainId(chainId);
    setViewMode('store-selector');
  };

  const handleStoreSelect = (storeId: string, store: StoreWithDistance) => {
    // Only allow selection if in range or if admin in test mode
    if (store.inRange || isAdmin) {
      setSelectedStoreId(storeId);
      setViewMode('workflow');
    }
  };

  const handleCancelWorkflow = () => {
    setViewMode('list');
    setSelectedChainId(null);
    setSelectedStoreId(null);
    setUserLocation(null);
    setLocationError(null);
  };

  // Chain Selector View
  if (viewMode === 'chain-selector') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" />
              Seleccionar Cadena
            </h1>
            <p className="text-sm text-muted-foreground">Paso 1 de 2: Selecciona la cadena</p>
          </div>
          <Button variant="outline" onClick={handleCancelWorkflow} data-testid="button-cancel-chain">
            Cancelar
          </Button>
        </div>

        <div className="grid gap-3">
          {chains.map((chain) => (
            <Card 
              key={chain.id} 
              className="hover-elevate cursor-pointer" 
              onClick={() => handleChainSelect(chain.id)}
              data-testid={`card-chain-${chain.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{chain.name}</h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Store Selector View
  if (viewMode === 'store-selector') {
    const selectedChain = chains.find(c => c.id === selectedChainId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('chain-selector')}
            data-testid="button-back-to-chains"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Seleccionar Tienda
            </h1>
            <p className="text-sm text-muted-foreground">
              Paso 2 de 2: Selecciona la tienda de {selectedChain?.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancelWorkflow} data-testid="button-cancel-store">
            Cancelar
          </Button>
        </div>

        {userLocation && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Ubicación obtenida correctamente
            </AlertDescription>
          </Alert>
        )}

        {isGettingLocation && (
          <Alert>
            <AlertDescription>Obteniendo ubicación...</AlertDescription>
          </Alert>
        )}

        {locationError && (
          <Alert variant="destructive">
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {storesWithDistance.map((store) => (
            <Card 
              key={store.id}
              className={`${store.inRange || isAdmin ? 'hover-elevate cursor-pointer' : 'opacity-75'}`}
              onClick={() => handleStoreSelect(store.id, store)}
              data-testid={`card-store-${store.id}`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {store.chainName} • {store.city}
                      </p>
                    </div>
                    {!store.hasCoordinates && (
                      <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                        Sin coordenadas
                      </Badge>
                    )}
                    {store.hasCoordinates && !store.inRange && (
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                        Fuera de rango
                      </Badge>
                    )}
                    {store.inRange && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        En rango
                      </Badge>
                    )}
                  </div>
                  
                  {store.distance !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{formatDistance(store.distance)} de distancia</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!storesWithDistance.some(s => s.inRange) && isAdmin && (
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Como administrador, puedes usar el "Modo Prueba" para continuar sin estar en rango.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Workflow View
  if (viewMode === 'workflow' && selectedStoreId) {
    const selectedStore = allStores.find(s => s.id === selectedStoreId);
    
    return (
      <NewVisitWorkflow
        store={selectedStore!}
        products={products}
        onCancel={handleCancelWorkflow}
        onComplete={handleCancelWorkflow}
      />
    );
  }

  // List View (default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mis Visitas</h1>
          <p className="text-sm text-muted-foreground">Historial y pendientes</p>
        </div>
        <Button className="gap-2" onClick={handleStartNewVisit} data-testid="button-new-evaluation">
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

      <div className="text-center py-12 text-muted-foreground">
        <p>No hay visitas registradas</p>
        <p className="text-sm mt-2">Haz clic en "Nueva Evaluación" para comenzar</p>
      </div>
    </div>
  );
}
