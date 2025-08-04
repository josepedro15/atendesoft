import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  GitBranch, 
  FileText, 
  CreditCard, 
  Layers,
  Users,
  Settings,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const DashboardSidebar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const clientNavItems = [
    { title: "Resumo", href: "/dashboard", icon: Home },
    { title: "Implementação", href: "/dashboard/implementation", icon: GitBranch },
    { title: "Contratos", href: "/dashboard/contracts", icon: FileText },
    { title: "Pagamentos", href: "/dashboard/payments", icon: CreditCard },
    { title: "Serviços", href: "/dashboard/services", icon: Layers },
  ];

  const adminNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { title: "Usuários", href: "/dashboard/users", icon: Users },
    { title: "Implementações", href: "/dashboard/admin-implementation", icon: GitBranch },
    { title: "Contratos", href: "/dashboard/admin-contracts", icon: FileText },
    { title: "Pagamentos", href: "/dashboard/admin-payments", icon: CreditCard },
    { title: "Serviços", href: "/dashboard/admin-services", icon: Layers },
    { title: "Configurações", href: "/dashboard/settings", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const getLinkClasses = (href: string) => {
    const isActive = location.pathname === href || 
      (href !== '/dashboard' && location.pathname.startsWith(href));
    
    return cn(
      "w-full justify-start gap-3 transition-all duration-200",
      isActive
        ? "bg-primary/20 text-primary border-r-2 border-primary shadow-lg shadow-primary/20"
        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
    );
  };

  return (
    <aside className="w-64 glass border-r border-primary/20 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
            {isAdmin ? 'Administração' : 'Menu Principal'}
          </h2>
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
          >
            {({ isActive }) => (
              <Button
                variant="ghost"
                className={getLinkClasses(item.href)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Button>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;