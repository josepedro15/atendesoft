import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Play, Edit, Plus, Users, GitBranch, RefreshCw, ChevronDown, ChevronRight, Info, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  step_number: number;
}

interface UserProgress {
  id: string;
  user_id: string;
  step_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  notes?: string;
  step: ImplementationStep;
}

interface Client {
  user_id: string;
  full_name: string;
  company: string;
  email: string;
  progress: UserProgress[];
}

interface AvailableUser {
  user_id: string;
  full_name: string;
  company: string;
  email: string;
}

// Etapas padrão de implementação
const defaultSteps: ImplementationStep[] = [
  {
    id: '1',
    title: 'Configuração Inicial',
    description: 'Setup do ambiente e configurações básicas',
    step_number: 1
  },
  {
    id: '2',
    title: 'Instalação de Ferramentas',
    description: 'Instalação e configuração das ferramentas necessárias',
    step_number: 2
  },
  {
    id: '3',
    title: 'Configuração de Fluxos',
    description: 'Criação e configuração dos fluxos de automação',
    step_number: 3
  },
  {
    id: '4',
    title: 'Testes Internos',
    description: 'Realização de testes para validação',
    step_number: 4
  },
  {
    id: '5',
    title: 'Em Produção',
    description: 'Sistema em produção e monitoramento',
    step_number: 5
  }
];

const AdminImplementation = () => {
  const [steps, setSteps] = useState<ImplementationStep[]>(defaultSteps);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [editingProgress, setEditingProgress] = useState<UserProgress | null>(null);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showDetailsDialog, setShowDetailsDialog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('in-progress');
  const { toast } = useToast();
  const { isAdmin, isInitialized } = useAuth();

  // Buscar dados quando o componente montar
  useEffect(() => {
    fetchData();
  }, []);

  // Buscar usuários disponíveis sempre que o modal abrir
  useEffect(() => {
    if (showAddClientDialog) {
      console.log('🔄 Modal aberto via useEffect, buscando usuários...');
      fetchAvailableUsers();
    }
  }, [showAddClientDialog]);

  // Monitorar mudanças na aba ativa
  useEffect(() => {
    console.log('🔄 Aba alterada via useEffect:', activeTab);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando dados de implementação...');
      
      // Buscar etapas de implementação do banco
      const { data: stepsData, error: stepsError } = await supabase
        .from('implementation_steps')
        .select('*')
        .order('step_number');

      if (stepsError) {
        console.error('❌ Erro ao buscar etapas:', stepsError);
        // Usar etapas padrão se não houver no banco
        setSteps(defaultSteps);
      } else {
        console.log('📋 Etapas encontradas:', stepsData?.length || 0);
        setSteps(stepsData || defaultSteps);
      }

      // Buscar clientes com progresso de implementação
      const { data: progressData, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select(`
          *,
          implementation_steps(*)
        `);

      if (progressError) {
        console.error('❌ Erro ao buscar progresso:', progressError);
        setClients([]);
      } else {
        console.log('📊 Progresso encontrado:', progressData?.length || 0);
        // Agrupar progresso por usuário
        const progressByUser = new Map<string, UserProgress[]>();
        (progressData || []).forEach((progress: any) => {
          if (!progressByUser.has(progress.user_id)) {
            progressByUser.set(progress.user_id, []);
          }
          progressByUser.get(progress.user_id)!.push(progress);
        });

        // Buscar informações dos usuários
        const userIds = Array.from(progressByUser.keys());
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name, company')
            .in('user_id', userIds);

          if (!profilesError && profilesData) {
            const clientsWithData: Client[] = profilesData.map(profile => ({
              user_id: profile.user_id,
              full_name: profile.full_name || 'Nome não informado',
              company: profile.company || 'Empresa não informada',
              email: 'email@exemplo.com',
              progress: progressByUser.get(profile.user_id) || []
            }));
            setClients(clientsWithData);
            console.log('👥 Clientes com implementação:', clientsWithData.length);
          }
        } else {
          setClients([]);
          console.log('⚠️ Nenhum cliente com implementação encontrado');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de implementação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('🔄 Buscando usuários disponíveis...');
      
      // Buscar todos os usuários que não têm implementação
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, company');

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        setAvailableUsers([]);
        return;
      }

      // Buscar usuários que já têm implementação
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select('user_id');

      if (progressError) {
        console.error('❌ Erro ao buscar progresso existente:', progressError);
        setAvailableUsers([]);
        return;
      }

      // Filtrar usuários que não têm implementação
      const usersWithImplementation = new Set(existingProgress?.map(p => p.user_id) || []);
      const availableUsersData = (profilesData || [])
        .filter(profile => !usersWithImplementation.has(profile.user_id))
        .map(profile => ({
          user_id: profile.user_id,
          full_name: profile.full_name || 'Nome não informado',
          company: profile.company || 'Empresa não informada',
          email: 'email@exemplo.com'
        }));

      setAvailableUsers(availableUsersData);
      console.log('👥 Usuários disponíveis:', availableUsersData.length);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários disponíveis:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addClientImplementation = async () => {
    if (!selectedUserId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário para adicionar",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Criando implementação para usuário:', selectedUserId);
      
      // Criar progresso de implementação para todas as etapas
      const progressEntries = steps.map(step => ({
        user_id: selectedUserId,
        step_id: step.id,
        status: 'pending' as const
      }));

      const { error } = await supabase
        .from('user_implementation_progress')
        .insert(progressEntries);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Implementação iniciada para o cliente selecionado"
      });

      setShowAddClientDialog(false);
      setSelectedUserId('');
      
      // Recarregar dados
      await fetchData();
      // Recarregar usuários disponíveis após um pequeno delay
      setTimeout(() => {
        fetchAvailableUsers();
      }, 500);
    } catch (error) {
      console.error('❌ Erro ao criar implementação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a implementação",
        variant: "destructive"
      });
    }
  };

  const updateProgress = async (progressId: string, data: Partial<UserProgress>) => {
    try {
      console.log('🔄 === ATUALIZANDO PROGRESSO ===');
      console.log('📝 Progress ID:', progressId);
      console.log('📊 Dados para atualizar:', data);
      console.log('🔑 Tipo do progressId:', typeof progressId);
      console.log('🔑 ProgressId é válido:', progressId && progressId !== 'new');
      
      // Verificar se o progressId é válido
      if (!progressId || progressId === 'new') {
        console.error('❌ Progress ID inválido:', progressId);
        toast({
          title: "Erro",
          description: "ID de progresso inválido",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar se os dados são válidos
      if (!data || Object.keys(data).length === 0) {
        console.error('❌ Dados inválidos:', data);
        toast({
          title: "Erro",
          description: "Dados inválidos para atualização",
          variant: "destructive"
        });
        return;
      }
      
      // REMOVER CAMPOS INVÁLIDOS - apenas campos que existem na tabela
      const validData = {
        status: data.status,
        notes: data.notes,
        started_at: data.started_at,
        completed_at: data.completed_at
      };
      
      // Remover campos undefined/null
      Object.keys(validData).forEach(key => {
        if (validData[key as keyof typeof validData] === undefined || validData[key as keyof typeof validData] === null) {
          delete validData[key as keyof typeof validData];
        }
      });
      
      console.log('✅ Dados limpos para atualização:', validData);
      
      const { data: updateResult, error } = await supabase
        .from('user_implementation_progress')
        .update(validData)
        .eq('id', progressId)
        .select();

      console.log('✅ Resultado da atualização:', updateResult);
      console.log('❌ Erro da atualização:', error);

      if (error) {
        console.error('❌ Erro ao atualizar:', error);
        throw error;
      }

      console.log('✅ Atualização bem-sucedida!');
      toast({
        title: "Progresso Atualizado",
        description: "O status da implementação foi atualizado com sucesso",
      });

      // Recarregar dados
      console.log('🔄 Recarregando dados...');
      await fetchData();
      console.log('✅ Dados recarregados!');
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar o progresso: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Concluído</div>;
      case 'in_progress':
        return <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Em Progresso</div>;
      default:
        return <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pendente</div>;
    }
  };

  const getProgressPercentage = (client: Client) => {
    if (!steps.length) return 0;
    const completedSteps = client.progress.filter(p => p.status === 'completed').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Separar clientes por status
  const clientsInProgress = clients.filter(client => getProgressPercentage(client) < 100);
  const clientsCompleted = clients.filter(client => getProgressPercentage(client) === 100);

  const toggleCardExpansion = (clientId: string) => {
    console.log('🔄 Toggle card expansion chamado para:', clientId);
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
        console.log('📂 Card colapsado:', clientId);
      } else {
        newSet.add(clientId);
        console.log('📂 Card expandido:', clientId);
      }
      console.log('📂 Estado atual dos cards expandidos:', Array.from(newSet));
      return newSet;
    });
  };

  const isCardExpanded = (clientId: string) => expandedCards.has(clientId);

  // Handler específico para o botão Configurar
  const handleConfigurarClick = (clientId: string) => {
    console.log('🔍 Botão Configurar clicado para:', clientId);
    toggleCardExpansion(clientId);
  };

  // Handler específico para o botão Detalhes
  const handleDetalhesClick = (clientId: string) => {
    console.log('🔍 Botão Detalhes clicado para:', clientId);
    setShowDetailsDialog(clientId);
  };

  // Handler para mudança de aba
  const handleTabChange = (value: string) => {
    console.log('🔍 Mudando aba para:', value);
    console.log('🔍 Estado anterior:', activeTab);
    console.log('🔍 Novo estado:', value);
    setActiveTab(value);
  };

  // Debug: Log do estado atual das abas
  console.log('🔍 Estado atual da aba:', activeTab);
  console.log('🔍 Clientes em andamento:', clientsInProgress.length);
  console.log('🔍 Clientes concluídos:', clientsCompleted.length);

  // Verificar se é admin
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

  // Mostrar loading enquanto não foi inicializado
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando implementações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-glow text-primary">
              Gerenciamento de Implementações
            </h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie o progresso das implementações dos clientes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{clients.length} clientes</span>
          </div>
          <Button
            onClick={() => {
              console.log('🔄 Forçando atualização de dados...');
              fetchData();
              fetchAvailableUsers();
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={() => setShowAddClientDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {/* Abas de Implementações */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="in-progress" 
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Em Andamento ({clientsInProgress.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Concluídos ({clientsCompleted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clientsInProgress.length === 0 ? (
            <Card className="card-glass">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Nenhum projeto em andamento</h3>
                  <p className="text-muted-foreground">
                    Todos os projetos foram concluídos ou ainda não foram iniciados.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {clientsInProgress.map((client) => (
                <Card key={client.user_id} className="card-glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(client.user_id)}
                          className="p-1 h-8 w-8"
                        >
                          {isCardExpanded(client.user_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <CardTitle className="text-xl">{client.full_name}</CardTitle>
                          <CardDescription>{client.company}</CardDescription>
                          <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {getProgressPercentage(client)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Progresso Geral</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetalhesClick(client.user_id)}
                            className="flex items-center gap-2"
                          >
                            <Info className="h-4 w-4" />
                            Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigurarClick(client.user_id)}
                            className="flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isCardExpanded(client.user_id) && (
                    <CardContent>
                      <div className="space-y-4">
                        {steps.map((step) => {
                          const progress = client.progress.find(p => p.step_id === step.id);
                          const status = progress?.status || 'pending';
                          
                          return (
                            <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <div>
                                  <h4 className="font-medium">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                  {progress?.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {progress.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {getStatusBadge(status)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProgress(progress || { id: 'new', user_id: client.user_id, step_id: step.id, status: 'pending', step } as UserProgress)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clientsCompleted.length === 0 ? (
            <Card className="card-glass">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Nenhum projeto concluído</h3>
                  <p className="text-muted-foreground">
                    Todos os projetos ainda estão em andamento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {clientsCompleted.map((client) => (
                <Card key={client.user_id} className="card-glass border-green-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(client.user_id)}
                          className="p-1 h-8 w-8"
                        >
                          {isCardExpanded(client.user_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <CardTitle className="text-xl">{client.full_name}</CardTitle>
                          <CardDescription>{client.company}</CardDescription>
                          <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500 flex items-center gap-1">
                            <CheckCircle className="h-5 w-5" />
                            100%
                          </div>
                          <div className="text-sm text-muted-foreground">Concluído</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetalhesClick(client.user_id)}
                            className="flex items-center gap-2"
                          >
                            <Info className="h-4 w-4" />
                            Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigurarClick(client.user_id)}
                            className="flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isCardExpanded(client.user_id) && (
                    <CardContent>
                      <div className="space-y-4">
                        {steps.map((step) => {
                          const progress = client.progress.find(p => p.step_id === step.id);
                          const status = progress?.status || 'pending';
                          
                          return (
                            <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <div>
                                  <h4 className="font-medium">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                  {progress?.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {progress.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {getStatusBadge(status)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProgress(progress || { id: 'new', user_id: client.user_id, step_id: step.id, status: 'pending', step } as UserProgress)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar cliente */}
      <Dialog open={showAddClientDialog} onOpenChange={(open) => {
        setShowAddClientDialog(open);
        if (open) {
          // Quando o modal abre, buscar usuários disponíveis
          console.log('🔄 Modal aberto, buscando usuários disponíveis...');
          fetchAvailableUsers();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente à Implementação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar Cliente</Label>
              {loadingUsers ? (
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name} - {user.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addClientImplementation} disabled={!selectedUserId}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar progresso */}
      {editingProgress && (
        <Dialog open={!!editingProgress} onOpenChange={() => setEditingProgress(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Progresso da Etapa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Etapa</Label>
                <p className="text-sm text-muted-foreground">
                  {steps.find(s => s.id === editingProgress.step_id)?.title}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingProgress.status} 
                  onValueChange={(value) => setEditingProgress({...editingProgress, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={editingProgress.notes || ''}
                  onChange={(e) => setEditingProgress({...editingProgress, notes: e.target.value})}
                  placeholder="Adicione observações sobre esta etapa..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingProgress(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  updateProgress(editingProgress.id, editingProgress);
                  setEditingProgress(null);
                }}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para detalhes do cliente */}
      <Dialog open={!!showDetailsDialog} onOpenChange={() => setShowDetailsDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Implementação</DialogTitle>
          </DialogHeader>
          {showDetailsDialog && (() => {
            const client = clients.find(c => c.user_id === showDetailsDialog);
            if (!client) return null;
            
            return (
              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Informações do Cliente</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {client.full_name}
                    </div>
                    <div>
                      <span className="font-medium">Empresa:</span> {client.company}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {client.email}
                    </div>
                    <div>
                      <span className="font-medium">Progresso Geral:</span> {getProgressPercentage(client)}%
                    </div>
                  </div>
                </div>

                {/* Resumo das Etapas */}
                <div>
                  <h3 className="font-semibold mb-3">Resumo das Etapas</h3>
                  <div className="space-y-3">
                    {steps.map((step) => {
                      const progress = client.progress.find(p => p.step_id === step.id);
                      const status = progress?.status || 'pending';
                      
                      return (
                        <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            <div>
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(status)}
                            {progress?.started_at && (
                              <div className="text-xs text-muted-foreground">
                                Iniciado: {new Date(progress.started_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {progress?.completed_at && (
                              <div className="text-xs text-muted-foreground">
                                Concluído: {new Date(progress.completed_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observações */}
                {client.progress.some(p => p.notes) && (
                  <div>
                    <h3 className="font-semibold mb-3">Observações</h3>
                    <div className="space-y-2">
                      {client.progress
                        .filter(p => p.notes)
                        .map((progress) => (
                          <div key={progress.id} className="bg-muted/20 rounded-lg p-3">
                            <div className="font-medium text-sm mb-1">
                              {steps.find(s => s.id === progress.step_id)?.title}
                            </div>
                            <p className="text-sm text-muted-foreground">{progress.notes}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(null)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setShowDetailsDialog(null);
                    // Expandir o card automaticamente
                    if (!isCardExpanded(client.user_id)) {
                      toggleCardExpansion(client.user_id);
                    }
                  }}>
                    Editar Implementação
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminImplementation; 