import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  GitBranch, 
  CreditCard, 
  DollarSign, 
  Layers, 
  MessageSquare,
  UserPlus,
  FileText,
  Settings,
  BarChart3
} from "lucide-react";

import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import { Button } from "@/components/ui/button";


// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para gerar estatísticas baseadas nos dados reais
const generateStats = (stats: any) => [
  {
    id: '1',
    title: 'Usuários Cadastrados',
    value: stats.totalUsers,
    description: `+${stats.activeUsers} este mês`,
    icon: <Users className="h-4 w-4" />,
    trend: { value: stats.activeUsers, isPositive: stats.activeUsers > 0 },
    link: '/dashboard/users',
    linkText: 'Ver todos os usuários'
  },
  {
    id: '2',
    title: 'Projetos em Implementação',
    value: stats.activeImplementations,
    description: `${stats.activeImplementations} em progresso`,
    icon: <GitBranch className="h-4 w-4" />,
    link: '/dashboard/admin-implementation',
    linkText: 'Gerenciar implementações'
  },
  {
    id: '3',
    title: 'Pagamentos Pendentes',
    value: formatCurrency(stats.pendingAmount),
    description: `${stats.pendingPayments} faturas`,
    icon: <CreditCard className="h-4 w-4" />,
    variant: 'warning' as const,
    link: '/dashboard/admin-payments',
    linkText: 'Ver pagamentos'
  },
  {
    id: '4',
    title: 'Faturamento do Mês',
    value: formatCurrency(stats.monthlyRevenue),
    description: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}% vs mês anterior`,
    icon: <DollarSign className="h-4 w-4" />,
    trend: { value: Math.abs(stats.monthlyGrowth), isPositive: stats.monthlyGrowth >= 0 },
    variant: 'success' as const
  },
  {
    id: '5',
    title: 'Serviços Ativos',
    value: stats.activeServices,
    description: `${stats.activeServices} ativos`,
    icon: <Layers className="h-4 w-4" />,
    link: '/dashboard/admin-services',
    linkText: 'Ver serviços'
  },
  {
    id: '6',
    title: 'Total de Pagamentos',
    value: stats.totalPayments,
    description: `${stats.pendingPayments} pendentes`,
    icon: <MessageSquare className="h-4 w-4" />,
    variant: 'default' as const,
    link: '/dashboard/admin-payments',
    linkText: 'Ver pagamentos'
  }
];

const mockQuickActions = [
  {
    id: '1',
    title: 'Adicionar Cliente',
    description: 'Cadastrar novo usuário',
    icon: <UserPlus className="h-4 w-4" />,
    route: '/dashboard/users',
    color: 'primary' as const
  },
  {
    id: '2',
    title: 'Novo Contrato',
    description: 'Criar contrato',
    icon: <FileText className="h-4 w-4" />,
    route: '/dashboard/admin-contracts',
    color: 'success' as const
  },
  {
    id: '3',
    title: 'Configurações',
    description: 'Ajustes do sistema',
    icon: <Settings className="h-4 w-4" />,
    route: '/dashboard/settings',
    color: 'warning' as const
  }
];

const AdminDashboard = () => {
  const { isAdmin, isLoading, isInitialized } = useAuth();
  const { stats, loading: dashboardLoading, error } = useDashboard();
  const navigate = useNavigate();

  // Debug: Log do estado do useAuth
  console.log('🔍 AdminDashboard - useAuth state:', { isAdmin, isLoading, isInitialized });
  console.log('🔍 AdminDashboard - useDashboard state:', { stats, dashboardLoading, error });

  useEffect(() => {
    // Só redirecionar se já foi inicializado e não é admin
    if (isInitialized && !isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, isInitialized, navigate]);

  // Mostrar loading enquanto não foi inicializado ou dashboard carregando
  if (!isInitialized || isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Verificar se é admin após inicialização
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

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start mb-4">
          <h1 className="text-4xl font-bold text-glow text-primary">
            Dashboard Administrativo
          </h1>
        </div>
      </div>

      {/* Debug: Log dos valores */}
      {console.log('🔍 AdminDashboard - Debug mode')}
      
      {/* Debug: Log dos valores */}
      {console.log('🔍 AdminDashboard - Valores recebidos:', stats)}
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generateStats(stats).map((stat) => (
          <StatsCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
            link={stat.link}
            linkText={stat.linkText}
            variant={stat.variant}
          />
        ))}
      </div>

      

      {/* Ações Rápidas */}
      <QuickActions actions={mockQuickActions} />

      {/* Placeholder para outras seções */}
      <div className="text-center p-8 border border-dashed border-primary/20 rounded-lg">
        <p className="text-muted-foreground">
          Outras seções serão adicionadas aqui
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard; 