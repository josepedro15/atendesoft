import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { isAdmin, isInitialized, isAuthenticated, isLoading } = useAuth();

  console.log('🔍 Dashboard Debug - isAdmin:', isAdmin, 'isInitialized:', isInitialized, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Mostrar loading enquanto não foi inicializado
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
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
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Status da Autenticação</h2>
            <p>Admin: {isAdmin ? 'Sim' : 'Não'}</p>
            <p>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</p>
            <p>Inicializado: {isInitialized ? 'Sim' : 'Não'}</p>
            <p>Carregando: {isLoading ? 'Sim' : 'Não'}</p>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Navegação</h2>
            <div className="space-y-2">
              <a href="/dashboard" className="block p-2 bg-blue-500 text-white rounded">Dashboard Principal</a>
              {isAdmin && (
                <>
                  <a href="/dashboard/users" className="block p-2 bg-green-500 text-white rounded">Gerenciar Usuários</a>
                  <a href="/dashboard/admin-implementation" className="block p-2 bg-green-500 text-white rounded">Implementações</a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;