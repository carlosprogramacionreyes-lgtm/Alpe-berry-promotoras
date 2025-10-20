import { Home, MapPin, BarChart3, Settings, LogOut, Grape } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";

const menuItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Visitas", url: "/visits", icon: MapPin },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Configuración", url: "/config", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(250,84%,54%)] to-primary flex items-center justify-center">
            <Grape className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground">Berry QI</h2>
            <p className="text-xs text-muted-foreground">Quality Inspector</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">SA</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">superadmin</p>
              <p className="text-xs text-muted-foreground">admin</p>
            </div>
          </div>
          <button 
            className="p-2 hover-elevate active-elevate-2 rounded-md"
            onClick={() => console.log('Logout clicked')}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
