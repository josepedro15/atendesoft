import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Settings
} from "lucide-react";

import StatsCard from "./StatsCard";
import ImplementationsTable from "./ImplementationsTable";
import PaymentsTable from "./PaymentsTable";
import ContractsList from "./ContractsList";
import AlertsList from "./AlertsList";
import QuickActions from "./QuickActions";

// Dados mockados para demonstração
const mockStats = [
  {
    id: '1',
    title: 'Clientes Ativos',
    value: 24,
    description: '+3 este mês',
    icon: <Users className="h-4 w-4" />,
    trend: { value: 12, isPositive: true },
    link: '/dashboard/users',
    linkText: 'Ver todos os clientes'
  },
  {
    id: '2',
    title: 'Projetos em Implementação',
    value: 8,
    description: '3 em progresso',
    icon: <GitBranch className="h-4 w-4" />,
    link: '/dashboard/admin-implementation',
    linkText: 'Gerenciar implementações'
  },
  {
    id: '3',
    title: 'Pagamentos Pendentes',
    value: 'R$ 45.200',
    description: '12 faturas',
    icon: <CreditCard className="h-4 w-4" />,
    variant: 'warning' as const,
    link: '/dashboard/admin-payments',
    linkText: 'Ver pagamentos'
  },
  {
    id: '4',
    title: 'Recebido no Mês',
    value: 'R$ 128.500',
    description: '+18% vs mês anterior',
    icon: <DollarSign className="h-4 w-4" />,
    trend: { value: 18, isPositive: true },
    variant: 'success' as const
  },
  {
    id: '5',
    title: 'Serviços Ativos',
    value: 32,
    description: '28 ativos, 4 pendentes',
    icon: <Layers className="h-4 w-4" />,
    link: '/dashboard/admin-services',
    linkText: 'Ver serviços'
  },
  {
    id: '6',
    title: 'Tickets de Suporte',
    value: 5,
    description: '2 urgentes',
    icon: <MessageSquare className="h-4 w-4" />,
    variant: 'danger' as const,
    link: '/dashboard/support',
    linkText: 'Ver tickets'
  }
];

const mockImplementations = [
  {
    id: '1',
    client: 'Empresa ABC Ltda',
    service: 'Automação de Vendas',
    currentStep: 'Configuração de Fluxos',
    progress: 75,
    status: 'in_progress' as const,
    lastUpdate: 'há 2 horas'
  },
  {
    id: '2',
    client: 'Tech Solutions',
    service: 'Chatbot IA',
    currentStep: 'Testes Internos',
    progress: 90,
    status: 'in_progress' as const,
    lastUpdate: 'há 1 dia'
  },
  {
    id: '3',
    client: 'Digital Marketing Pro',
    service: 'Integração CRM',
    currentStep: 'Instalação VPS',
    progress: 25,
    status: 'in_progress' as const,
    lastUpdate: 'há 3 dias'
  },
  {
    id: '4',
    client: 'E-commerce Plus',
    service: 'Automação Completa',
    currentStep: 'Em Produção',
    progress: 100,
    status: 'completed' as const,
    lastUpdate: 'há 1 semana'
  }
];

const mockPayments = [
  {
    id: '1',
    client: 'Empresa ABC Ltda',
    service: 'Automação de Vendas',
    status: 'pending' as const,
    amount: 2500,
    dueDate: '2024-01-15',
    paidDate: undefined
  },
  {
    id: '2',
    client: 'Tech Solutions',
    service: 'Chatbot IA',
    status: 'paid' as const,
    amount: 1800,
    dueDate: '2024-01-10',
    paidDate: '2024-01-08'
  },
  {
    id: '3',
    client: 'Digital Marketing Pro',
    service: 'Integração CRM',
    status: 'overdue' as const,
    amount: 3200,
    dueDate: '2024-01-05',
    paidDate: undefined
  },
  {
    id: '4',
    client: 'E-commerce Plus',
    service: 'Automação Completa',
    status: 'pending' as const,
    amount: 4500,
    dueDate: '2024-01-20',
    paidDate: undefined
  }
];

const mockContracts = [
  {
    id: '1',
    client: 'Empresa ABC Ltda',
    service: 'Automação de Vendas',
    status: 'active' as const,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyPrice: 2500,
    lastUpdate: '2024-01-10'
  },
  {
    id: '2',
    client: 'Tech Solutions',
    service: 'Chatbot IA',
    status: 'active' as const,
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    monthlyPrice: 1800,
    lastUpdate: '2024-01-08'
  },
  {
    id: '3',
    client: 'Digital Marketing Pro',
    service: 'Integração CRM',
    status: 'pending' as const,
    startDate: '2024-01-15',
    endDate: '2024-12-14',
    monthlyPrice: 3200,
    lastUpdate: '2024-01-12'
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'payment_overdue' as const,
    title: 'Pagamento Atrasado',
    description: 'Digital Marketing Pro - R$ 3.200 vencido há 5 dias',
    severity: 'high' as const,
    client: 'Digital Marketing Pro',
    amount: 3200,
    daysOverdue: 5,
    link: '/dashboard/admin-payments'
  },
  {
    id: '2',
    type: 'implementation_delayed' as const,
    title: 'Implementação Atrasada',
    description: 'E-commerce Plus - Etapa 3 atrasada há 2 dias',
    severity: 'medium' as const,
    client: 'E-commerce Plus',
    link: '/dashboard/admin-implementation'
  },
  {
    id: '3',
    type: 'contract_pending' as const,
    title: 'Contrato Pendente',
    description: 'Digital Marketing Pro - Aguardando assinatura',
    severity: 'low' as const,
    client: 'Digital Marketing Pro',
    link: '/dashboard/admin-contracts'
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
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
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

      {/* 1. Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStats.map((stat) => (
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

      {/* 2. Listagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImplementationsTable implementations={mockImplementations} />
        <PaymentsTable payments={mockPayments} />
      </div>

      {/* 3. Rodapé */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContractsList contracts={mockContracts} />
        <AlertsList alerts={mockAlerts} />
      </div>
    </div>
  );
};

export default AdminDashboard; 