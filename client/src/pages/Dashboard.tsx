import { useQuery } from '@tanstack/react-query';
import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Users, Store, CheckCircle, Clock, AlertTriangle, TrendingUp, Plus, BarChart3, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Evaluation } from '@shared/schema';

interface DashboardStats {
  visitsToday: number;
  visitsThisMonth: number;
  activePromoters: number;
  totalStores: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  avgQuality: string;
}

interface AuthUser {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery<AuthUser>({ 
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({ 
    queryKey: ['/api/stats/dashboard'],
    enabled: !!user,
  });

  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
    enabled: !!user,
  });

  const recentEvaluations = evaluations.slice(0, 5);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-MX', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(270,70%,60%)] via-primary to-[hsl(240,70%,55%)] bg-clip-text text-transparent mb-1">Bienvenido, {user.user?.name || user.user?.username}</h1>
          <p className="text-sm text-muted-foreground capitalize">{user.user?.role}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Hoy</p>
          <p className="text-sm font-medium text-foreground">{formattedDate}</p>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard 
              title="Visitas Hoy" 
              value={stats?.visitsToday || 0} 
              subtitle="Evaluaciones de hoy"
              icon={MapPin}
              iconColor="text-primary"
              gradient
            />
            <MetricCard 
              title="Promotores Activos" 
              value={stats?.activePromoters || 0} 
              subtitle="Total de promotores"
              icon={Users}
              iconColor="text-chart-2"
            />
            <MetricCard 
              title="Tiendas Registradas" 
              value={stats?.totalStores || 0} 
              subtitle="Tiendas activas"
              icon={Store}
              iconColor="text-primary"
            />
            <MetricCard 
              title="Visitas (Mes)" 
              value={stats?.visitsThisMonth || 0} 
              subtitle="Mes actual"
              icon={MapPin}
              iconColor="text-chart-3"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard 
              title="Pendientes" 
              value={stats?.pendingEvaluations || 0} 
              subtitle="Requieren atención"
              icon={Clock}
              iconColor="text-muted-foreground"
            />
            <MetricCard 
              title="Evaluaciones (Mes)" 
              value={stats?.completedEvaluations || 0} 
              subtitle={`${stats?.visitsThisMonth || 0} totales`}
              icon={CheckCircle}
              iconColor="text-chart-2"
              gradient
            />
            <MetricCard 
              title="Incidencias Pendientes" 
              value={0} 
              subtitle="0 Alta prioridad"
              icon={AlertTriangle}
              iconColor="text-destructive"
            />
            <MetricCard 
              title="Calidad Promedio" 
              value={`${stats?.avgQuality || '0.0'}/5`} 
              subtitle={parseFloat(stats?.avgQuality || '0') >= 3 ? 'Buena' : 'Regular'}
              icon={TrendingUp}
              iconColor="text-chart-2"
            />
          </div>
        </>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              className="w-full justify-start gap-2 h-auto py-4" 
              onClick={() => setLocation('/visits')}
              data-testid="button-new-visit"
            >
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Nueva Visita</div>
                <div className="text-xs opacity-90">Iniciar inspección en tienda</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-auto py-4" 
              onClick={() => setLocation('/visits')}
              data-testid="button-my-visits"
            >
              <MapPin className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Mis Visitas</div>
                <div className="text-xs text-muted-foreground">Ver historial y pendientes</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-auto py-4" 
              onClick={() => setLocation('/reports')}
              data-testid="button-reports"
            >
              <BarChart3 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Reportes</div>
                <div className="text-xs text-muted-foreground">Consultar estadísticas</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-auto py-4" 
              onClick={() => setLocation('/config')}
              data-testid="button-management"
            >
              <Settings className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Gestión</div>
                <div className="text-xs text-muted-foreground">Administrar sistema</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evaluationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentEvaluations.length > 0 ? (
              <div className="space-y-3">
                {recentEvaluations.map((evaluation: any) => (
                  <div key={evaluation.id} className="flex items-start gap-3 p-3 rounded-lg hover-elevate">
                    <div className="w-2 h-2 rounded-full bg-chart-2 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {evaluation.status === 'completed' ? 'Evaluación completada' : 'Evaluación en progreso'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evaluation.createdAt).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {new Date(evaluation.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No hay actividad reciente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
