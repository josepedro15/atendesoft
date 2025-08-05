import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  GitBranch, 
  FileText, 
  CreditCard, 
  Layers,
  Users,
  Settings,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const DashboardSidebar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-expand on hover
  useEffect(() => {
    if (isHovering) {
      setIsExpanded(true);
    } else {
      // Delay to allow moving mouse to menu items
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHovering]);

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
    <aside 
      className={cn(
        "glass border-r border-primary/20 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out relative",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className={cn(
            "text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
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
                className={cn(
                  getLinkClasses(item.href),
                  "transition-all duration-300",
                  isExpanded ? "justify-start gap-3" : "justify-center p-2"
                )}
                title={!isExpanded ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.title}
                </span>
              </Button>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Expand indicator */}
      <div className={cn(
        "absolute top-1/2 -right-3 transform -translate-y-1/2 transition-opacity duration-300",
        isExpanded ? "opacity-0" : "opacity-60"
      )}>
        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
          <ChevronRight className="h-3 w-3 text-primary" />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;