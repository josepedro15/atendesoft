import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { isAdmin, isInitialized, isLoading, user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🔄 Fazendo logout...');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  // Mostrar loading enquanto não foi inicializado
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard - TESTE</h1>
        
        <div className="grid gap-6">
          {/* Informações do usuário */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Nome:</strong> {profile?.full_name || 'N/A'}</p>
              <p><strong>Empresa:</strong> {profile?.company || 'N/A'}</p>
              <p><strong>Role:</strong> {userRole}</p>
              <p><strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
              <p><strong>Inicializado:</strong> {isInitialized ? 'Sim' : 'Não'}</p>
              <p><strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}</p>
            </div>
          </div>

          {/* Dashboard baseado no role */}
          {isAdmin ? (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Dashboard Administrativo</h2>
              <p className="text-muted-foreground mb-4">
                Bem-vindo ao painel administrativo! Aqui você pode gerenciar clientes, implementações, pagamentos e muito mais.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Gerenciar Usuários</h3>
                  <p className="text-sm text-muted-foreground">Adicionar e editar clientes</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Implementações</h3>
                  <p className="text-sm text-muted-foreground">Acompanhar projetos</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Pagamentos</h3>
                  <p className="text-sm text-muted-foreground">Gerenciar faturas</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Serviços</h3>
                  <p className="text-sm text-muted-foreground">Configurar serviços</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Dashboard do Cliente</h2>
              <p className="text-muted-foreground mb-4">
                Bem-vindo ao seu painel! Aqui você pode acompanhar seus projetos, pagamentos e serviços.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Meus Projetos</h3>
                  <p className="text-sm text-muted-foreground">Acompanhar implementações</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Meus Pagamentos</h3>
                  <p className="text-sm text-muted-foreground">Ver faturas e pagamentos</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Meus Contratos</h3>
                  <p className="text-sm text-muted-foreground">Visualizar contratos</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-accent">
                  <h3 className="font-semibold">Meus Serviços</h3>
                  <p className="text-sm text-muted-foreground">Ver serviços ativos</p>
                </button>
              </div>
            </div>
          )}

          {/* Botão de logout */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Ações</h2>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;