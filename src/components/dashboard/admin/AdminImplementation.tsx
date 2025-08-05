import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
      console.log('🔄 === TESTE COMPLETO DO SUPABASE ===');
      
      // TESTE 1: Verificar se o cliente Supabase está funcionando
      console.log('📋 TESTE 1: Verificando cliente Supabase...');
      console.log('🔗 URL:', supabase.supabaseUrl);
      console.log('🔑 Anon Key:', supabase.supabaseKey ? 'Presente' : 'Ausente');
      
      // TESTE 2: Verificar autenticação
      console.log('🔐 TESTE 2: Verificando autenticação...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('✅ Sessão:', session ? 'Ativa' : 'Inativa');
      console.log('👤 Usuário logado:', session?.user?.email);
      console.log('❌ Erro sessão:', sessionError);
      
      // TESTE 3: Tentar acessar user_roles
      console.log('🆔 TESTE 3: Tentando acessar user_roles...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);
      
      console.log('✅ Acesso user_roles:', rolesData ? 'OK' : 'ERRO');
      console.log('📊 Dados user_roles:', rolesData);
      console.log('❌ Erro user_roles:', rolesError);
      
      // TESTE 4: Tentar acessar profiles
      console.log('👤 TESTE 4: Tentando acessar profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      console.log('✅ Acesso profiles:', profilesData ? 'OK' : 'ERRO');
      console.log('📊 Dados profiles:', profilesData);
      console.log('❌ Erro profiles:', profilesError);
      
      // TESTE 5: Tentar acessar auth.users (pode dar erro de permissão)
      console.log('🔐 TESTE 5: Tentando acessar auth.users...');
      try {
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        console.log('✅ Acesso auth.users:', users ? 'OK' : 'ERRO');
        console.log('📊 Total auth.users:', users?.length || 0);
        console.log('❌ Erro auth.users:', authError);
      } catch (authCatchError) {
        console.log('❌ Erro ao tentar auth.users:', authCatchError);
      }
      
      // TESTE 6: Buscar user_roles com role = 'user'
      console.log('👥 TESTE 6: Buscando user_roles com role = "user"...');
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'user');
      
      console.log('📊 User roles com role "user":', userRoles?.length || 0);
      console.log('👥 User roles:', userRoles);
      console.log('❌ Erro user roles:', userRolesError);
      
      // TESTE 7: Se encontrou user_roles, buscar perfis
      if (userRoles && userRoles.length > 0) {
        console.log('📋 TESTE 7: Buscando perfis dos usuários...');
        const userIds = userRoles.map(ur => ur.user_id);
        const { data: userProfiles, error: userProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        
        console.log('📊 Perfis encontrados:', userProfiles?.length || 0);
        console.log('👤 Perfis:', userProfiles);
        console.log('❌ Erro perfis:', userProfilesError);
        
        // TESTE 8: Criar lista final
        if (userProfiles && userProfiles.length > 0) {
          console.log('📝 TESTE 8: Criando lista de clientes...');
          const availableUsersData = userProfiles.map(profile => ({
            user_id: profile.user_id,
            full_name: profile.full_name || 'Nome não informado',
            company: profile.company || 'Empresa não informada',
            email: 'email@exemplo.com'
          }));
          
          console.log('✅ Clientes disponíveis:', availableUsersData);
          setAvailableUsers(availableUsersData);
        } else {
          console.log('⚠️ Nenhum perfil encontrado');
          setAvailableUsers([]);
        }
      } else {
        console.log('⚠️ Nenhum usuário com role "user" encontrado');
        setAvailableUsers([]);
      }
      
      console.log('✅ === TESTE CONCLUÍDO ===');
    } catch (error) {
      console.error('❌ Erro geral:', error);
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

  const toggleCardExpansion = (clientId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (clientId: string) => expandedCards.has(clientId);

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

      {/* Lista de Clientes */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : clients.length === 0 ? (
        <Card className="card-glass">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">👥</div>
              <h3 className="text-xl font-semibold">Nenhuma implementação encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Não há clientes com implementação em andamento. 
                Clique em "Adicionar Cliente" para iniciar uma nova implementação.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => (
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
                        onClick={() => setShowDetailsDialog(client.user_id)}
                        className="flex items-center gap-2"
                      >
                        <Info className="h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetailsDialog(client.user_id)}
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
                                  "{progress.notes}"
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
            {availableUsers.length === 0 && !loadingUsers && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nenhum cliente disponível para implementação.
                </p>
                <p className="text-xs text-muted-foreground">
                  Adicione clientes através do sistema de cadastro primeiro.
                </p>
                <Button
                  onClick={() => {
                    console.log('🔄 Testando busca manual...');
                    fetchAvailableUsers();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Testar Busca
                </Button>
              </div>
            )}
            {availableUsers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {availableUsers.length} cliente(s) disponível(is) para implementação.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={addClientImplementation}
                disabled={!selectedUserId || availableUsers.length === 0 || loadingUsers}
              >
                Adicionar Implementação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar progresso */}
      <Dialog open={!!editingProgress} onOpenChange={() => setEditingProgress(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Progresso</DialogTitle>
          </DialogHeader>
          {editingProgress && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editingProgress.status}
                  onValueChange={(value) => setEditingProgress({ ...editingProgress, status: value as any })}
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
                  onChange={(e) => setEditingProgress({ ...editingProgress, notes: e.target.value })}
                  placeholder="Adicione observações sobre o progresso..."
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
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para detalhes da implementação */}
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