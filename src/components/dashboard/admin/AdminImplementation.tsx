import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Play, Edit, Plus, Users, GitBranch } from "lucide-react";
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
  const { toast } = useToast();
  const { isAdmin, isInitialized } = useAuth();

  useEffect(() => {
    // Só buscar dados se for admin e já foi inicializado
    if (isAdmin && isInitialized && !dataFetched) {
      fetchData();
      fetchAvailableUsers();
      setDataFetched(true);
    }
  }, [isAdmin, isInitialized, dataFetched]);

  const createTestData = async () => {
    try {
      console.log('🔄 Criando dados de teste...');
      
      // Criar etapas de implementação se não existirem
      for (const step of defaultSteps) {
        await supabase
          .from('implementation_steps')
          .upsert(step, { onConflict: 'id' });
      }

      // Criar alguns usuários de teste se não existirem
      const testUsers = [
        { user_id: 'test-user-1', full_name: 'João Silva', company: 'Empresa ABC Ltda' },
        { user_id: 'test-user-2', full_name: 'Maria Santos', company: 'Tech Solutions' },
        { user_id: 'test-user-3', full_name: 'Pedro Costa', company: 'Digital Marketing Pro' }
      ];

      for (const user of testUsers) {
        // Criar perfil
        await supabase
          .from('profiles')
          .upsert(user, { onConflict: 'user_id' });
        
        // Criar role de usuário
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.user_id, role: 'user' }, { onConflict: 'user_id' });
      }

      console.log('✅ Dados de teste criados com sucesso');
      toast({
        title: "Dados de Teste Criados",
        description: "Foram criados 3 clientes de teste para demonstração"
      });

      // Recarregar dados
      await fetchData();
      await fetchAvailableUsers();
    } catch (error) {
      console.error('❌ Erro ao criar dados de teste:', error);
    }
  };

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
      console.log('🔍 Buscando usuários disponíveis...');
      
      // Buscar todos os usuários com role 'user' (clientes)
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'user');

      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
        setAvailableUsers([]);
        return;
      }

      console.log('👥 Usuários com role "user":', userRolesData?.length || 0);

      if (userRolesData && userRolesData.length > 0) {
        const userIds = userRolesData.map(r => r.user_id);
        console.log('🆔 IDs dos usuários:', userIds);
        
        // Buscar perfis dos usuários
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, company')
          .in('user_id', userIds);

        if (!profilesError && profilesData) {
          console.log('📋 Perfis encontrados:', profilesData.length);
          console.log('👤 Perfis:', profilesData);
          console.log('📊 Clientes atuais:', clients.length);
          
          // Se não há clientes com implementação, todos os usuários estão disponíveis
          if (clients.length === 0) {
            console.log('✅ Não há implementações, todos os usuários estão disponíveis');
            const availableUsersData = profilesData.map(profile => ({
              user_id: profile.user_id,
              full_name: profile.full_name || 'Nome não informado',
              company: profile.company || 'Empresa não informada',
              email: 'email@exemplo.com'
            }));
            setAvailableUsers(availableUsersData);
            console.log('📝 Usuários disponíveis:', availableUsersData);
          } else {
            console.log('🔍 Filtrando usuários que já têm implementação...');
            // Filtrar usuários que ainda não têm implementação
            const existingUserIds = new Set(clients.map(c => c.user_id));
            console.log('🚫 IDs com implementação existente:', Array.from(existingUserIds));
            const availableUsersData = profilesData
              .filter(profile => !existingUserIds.has(profile.user_id))
              .map(profile => ({
                user_id: profile.user_id,
                full_name: profile.full_name || 'Nome não informado',
                company: profile.company || 'Empresa não informada',
                email: 'email@exemplo.com'
              }));
            
            setAvailableUsers(availableUsersData);
            console.log('📝 Usuários disponíveis após filtro:', availableUsersData);
          }
        } else {
          console.error('❌ Erro ao buscar perfis:', profilesError);
          setAvailableUsers([]);
        }
      } else {
        console.log('⚠️ Nenhum usuário com role "user" encontrado');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar usuários disponíveis:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
      console.log('✅ Busca de usuários concluída');
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
      const { error } = await supabase
        .from('user_implementation_progress')
        .update(data)
        .eq('id', progressId);

      if (error) throw error;

      toast({
        title: "Progresso Atualizado",
        description: "O status da implementação foi atualizado com sucesso",
      });

      // Recarregar dados
      fetchData();
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o progresso",
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
              <Button
                onClick={createTestData}
                className="bg-primary hover:bg-primary/90"
              >
                Criar Dados de Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => (
            <Card key={client.user_id} className="card-glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{client.full_name}</CardTitle>
                    <CardDescription>{client.company}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {getProgressPercentage(client)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progresso Geral</div>
                  </div>
                </div>
              </CardHeader>
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
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar cliente */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente à Implementação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar Cliente</Label>
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
            </div>
            {availableUsers.length === 0 && !loadingUsers && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Todos os clientes já possuem implementação em andamento.
                </p>
                <Button
                  onClick={createTestData}
                  variant="outline"
                  size="sm"
                >
                  Criar Dados de Teste
                </Button>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={addClientImplementation}
                disabled={!selectedUserId || availableUsers.length === 0}
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
    </div>
  );
};

export default AdminImplementation;