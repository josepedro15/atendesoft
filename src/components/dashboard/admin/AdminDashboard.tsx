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
    title: 'Clientes Ativos',
    value: stats.totalUsers,
    description: `+${stats.activeUsers} este mês`,
    icon: <Users className="h-4 w-4" />,
    trend: { value: stats.activeUsers, isPositive: stats.activeUsers > 0 },
    link: '/dashboard/users',
    linkText: 'Ver todos os clientes'
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
    title: 'Recebido no Mês',
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
    title: 'Criar Usuário',
    description: 'Adicionar novo cliente',
    icon: <UserPlus className="h-4 w-4" />,
    route: '/dashboard/users',
    color: 'primary' as const
  },
  {
    id: '2',
    title: 'Nova Implementação',
    description: 'Iniciar projeto',
    icon: <GitBranch className="h-4 w-4" />,
    route: '/dashboard/admin-implementation',
    color: 'success' as const
  },
  {
    id: '3',
    title: 'Adicionar Contrato',
    description: 'Criar novo contrato',
    icon: <FileText className="h-4 w-4" />,
    route: '/dashboard/admin-contracts',
    color: 'warning' as const
  },
  {
    id: '4',
    title: 'Registrar Pagamento',
    description: 'Lançar pagamento',
    icon: <CreditCard className="h-4 w-4" />,
    route: '/dashboard/admin-payments',
    color: 'success' as const
  },
  {
    id: '5',
    title: 'Adicionar Serviço',
    description: 'Criar novo serviço',
    icon: <Layers className="h-4 w-4" />,
    route: '/dashboard/admin-services',
    color: 'primary' as const
  },
  {
    id: '6',
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
        <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-glow text-primary">
              Dashboard Administrativo
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Visão geral e controle central do sistema
            </p>
          </div>
        </div>
      </div>

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

      {/* Mostrar erro se houver */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Erro ao carregar dados: {error}
          </p>
        </div>
      )}

      {/* Ações Rápidas */}
      <QuickActions actions={mockQuickActions} />

      {/* Placeholder para outras seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Implementações</h3>
          <p>Componente em desenvolvimento...</p>
        </div>
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Pagamentos</h3>
          <p>Componente em desenvolvimento...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Contratos</h3>
          <p>Componente em desenvolvimento...</p>
        </div>
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Alertas</h3>
          <p>Componente em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 