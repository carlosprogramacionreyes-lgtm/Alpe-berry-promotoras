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
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(265,85%,57%)] via-[hsl(217,91%,60%)] to-[hsl(142,76%,45%)] p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Bienvenido, {user.user?.name || user.user?.username}</h1>
            <p className="text-sm text-white/80 capitalize">{user.user?.role}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Hoy</p>
            <p className="text-sm font-medium text-white">{formattedDate}</p>
          </div>
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
              iconColor="text-[hsl(265,85%,57%)]"
            />
            <MetricCard 
              title="Promotores Activos" 
              value={stats?.activePromoters || 0} 
              subtitle="Total de promotores"
              icon={Users}
              iconColor="text-[hsl(142,76%,45%)]"
            />
            <MetricCard 
              title="Tiendas Registradas" 
              value={stats?.totalStores || 0} 
              subtitle="Tiendas activas"
              icon={Store}
              iconColor="text-[hsl(217,91%,60%)]"
            />
            <MetricCard 
              title="Visitas (Mes)" 
              value={stats?.visitsThisMonth || 0} 
              subtitle="Mes actual"
              icon={MapPin}
              iconColor="text-[hsl(25,95%,53%)]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard 
              title="Pendientes" 
              value={stats?.pendingEvaluations || 0} 
              subtitle="Requieren atención"
              icon={Clock}
              iconColor="text-[hsl(0,84%,60%)]"
            />
            <MetricCard 
              title="Evaluaciones (Mes)" 
              value={stats?.completedEvaluations || 0} 
              subtitle={`${stats?.visitsThisMonth || 0} totales`}
              icon={CheckCircle}
              iconColor="text-[hsl(142,76%,45%)]"
            />
            <MetricCard 
              title="Incidencias Pendientes" 
              value={0} 
              subtitle="0 Alta prioridad"
              icon={AlertTriangle}
              iconColor="text-[hsl(25,95%,53%)]"
            />
            <MetricCard 
              title="Calidad Promedio" 
              value={`${stats?.avgQuality || '0.0'}/5`} 
              subtitle={parseFloat(stats?.avgQuality || '0') >= 3 ? 'Buena' : 'Regular'}
              icon={TrendingUp}
              iconColor="text-[hsl(265,85%,57%)]"
            />
          </div>
        </>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>⚡</span>
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-br from-[hsl(265,85%,57%)] to-[hsl(265,85%,47%)] text-white border-0 shadow-lg hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation('/visits')}
            data-testid="button-new-visit"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Nueva Visita</h3>
                  <p className="text-sm text-white/80">Iniciar inspección en tienda</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-[hsl(142,76%,45%)] to-[hsl(142,76%,35%)] text-white border-0 shadow-lg hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation('/visits')}
            data-testid="button-my-visits"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Mis Visitas</h3>
                  <p className="text-sm text-white/80">Ver historial y pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border hover-elevate active-elevate-2 cursor-pointer shadow-sm"
            onClick={() => setLocation('/reports')}
            data-testid="button-reports"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[hsl(217,91%,60%)]/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-[hsl(217,91%,60%)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Reportes</h3>
                  <p className="text-sm text-muted-foreground">Consultar estadísticas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div></div>

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
