import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AccountSummary from "@/components/dashboard/client/AccountSummary";
import ImplementationProgress from "@/components/dashboard/client/ImplementationProgress";
import ContractsView from "@/components/dashboard/client/ContractsView";
import PaymentsView from "@/components/dashboard/client/PaymentsView";
import ServicesView from "@/components/dashboard/client/ServicesView";
import UsersManagement from "@/components/dashboard/admin/UsersManagement";
import AdminImplementation from "@/components/dashboard/admin/AdminImplementation";
import AdminContracts from "@/components/dashboard/admin/AdminContracts";
import AdminPayments from "@/components/dashboard/admin/AdminPayments";
import AdminServices from "@/components/dashboard/admin/AdminServices";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

// Componente para controlar acesso admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-glow text-primary">Acesso Negado</h2>
          <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta página</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const Dashboard = () => {
  const { isAdmin, isInitialized, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto não foi inicializado
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background animated-bg">
        {/* Header Skeleton */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card-glass">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="card-glass">
                <div className="space-y-4">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 w-full bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Verificar se está autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-glow text-primary">Não Autenticado</h2>
          <p className="text-muted-foreground mt-2">Você precisa estar logado para acessar o dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animated-bg">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={
              isAdmin ? (
                <AdminDashboard />
              ) : (
                // Client Dashboard
                <div className="space-y-8">
                  <AccountSummary />
                  <ImplementationProgress />
                </div>
              )
            } />
            
            {/* Client Routes */}
            <Route path="/implementation" element={
              <div className="space-y-8">
                <ImplementationProgress />
              </div>
            } />
            <Route path="/contracts" element={<ContractsView />} />
            <Route path="/payments" element={<PaymentsView />} />
            <Route path="/services" element={<ServicesView />} />
            
            {/* Admin Routes - sempre renderizadas, acesso controlado internamente */}
            <Route path="/users" element={
              <AdminRoute>
                <UsersManagement />
              </AdminRoute>
            } />
            <Route path="/admin-implementation" element={
              <AdminRoute>
                <AdminImplementation />
              </AdminRoute>
            } />
            <Route path="/admin-contracts" element={
              <AdminRoute>
                <AdminContracts />
              </AdminRoute>
            } />
            <Route path="/admin-payments" element={
              <AdminRoute>
                <AdminPayments />
              </AdminRoute>
            } />
            <Route path="/admin-services" element={
              <AdminRoute>
                <AdminServices />
              </AdminRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;