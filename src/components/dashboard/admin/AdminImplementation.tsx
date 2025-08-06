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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
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
      fetchAvailableUsers();
    }
  }, [showAddClientDialog]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar etapas de implementação do banco
      const { data: stepsData, error: stepsError } = await supabase
        .from('implementation_steps')
        .select('*')
        .order('step_number');

      if (stepsError) {
        setSteps(defaultSteps);
      } else {
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
        setClients([]);
      } else {
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
          }
        } else {
          setClients([]);
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
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, company');

      if (profilesError) {
        setAvailableUsers([]);
        return;
      }

      const { data: existingProgress, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select('user_id');

      if (progressError) {
        setAvailableUsers([]);
        return;
      }

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
      
      await fetchData();
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
      if (!progressId || progressId === 'new') {
        toast({
          title: "Erro",
          description: "ID de progresso inválido",
          variant: "destructive"
        });
        return;
      }
      
      const validData = {
        status: data.status,
        notes: data.notes,
        started_at: data.started_at,
        completed_at: data.completed_at
      };
      
      Object.keys(validData).forEach(key => {
        if (validData[key as keyof typeof validData] === undefined || validData[key as keyof typeof validData] === null) {
          delete validData[key as keyof typeof validData];
        }
      });
      
      const { error } = await supabase
        .from('user_implementation_progress')
        .update(validData)
        .eq('id', progressId);

      if (error) throw error;

      toast({
        title: "Progresso Atualizado",
        description: "O status da implementação foi atualizado com sucesso",
      });

      await fetchData();
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
    console.log('🔥 Toggle card:', clientId, 'Current expanded:', expandedCard);
    setExpandedCard(prev => {
      const newValue = prev === clientId ? null : clientId;
      console.log('🔥 New expanded card:', newValue);
      return newValue;
    });
    setForceUpdate(prev => prev + 1);
  };

  const handleConfigurarClick = (clientId: string) => {
    console.log('🔥 Configurar click:', clientId);
    setExpandedCard(prev => prev === clientId ? null : clientId);
  };

  const handleDetalhesClick = (clientId: string) => {
    setShowDetailsDialog(clientId);
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
            onClick={() => {
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
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : clients.length === 0 ? (
          <Card className="card-glass">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground">
                  Adicione clientes para começar a gerenciar implementações.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients
              .sort((a, b) => getProgressPercentage(a) - getProgressPercentage(b))
              .map((client) => (
                <Card key={`${client.user_id}-${forceUpdate}`} className="card-glass w-full h-48 flex flex-col">
                  <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('🔥 Clique no botão expandir para:', client.user_id);
                            toggleCardExpansion(client.user_id);
                          }}
                          className="p-0 h-5 w-5"
                        >
                          {expandedCard === client.user_id ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-medium truncate">{client.full_name}</CardTitle>
                          <CardDescription className="text-xs truncate">{client.company}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {getProgressPercentage(client)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Progresso</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetalhesClick(client.user_id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigurarClick(client.user_id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                
                  <CardContent className={`pt-0 px-3 pb-2 flex-1 ${expandedCard === client.user_id ? 'overflow-y-auto' : 'flex items-center justify-center'}`}>
                    {expandedCard === client.user_id ? (
                      <div className="space-y-1">
                        {steps.map((step) => {
                          const progress = client.progress.find(p => p.step_id === step.id);
                          const status = progress?.status || 'pending';
                          
                          return (
                            <div key={step.id} className="flex items-center justify-between p-1 rounded border border-border/50">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(status)}
                                <div>
                                  <h4 className="font-medium text-xs">{step.title}</h4>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                  {progress?.notes && (
                                    <p className="text-xs text-muted-foreground italic">
                                      {progress.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {getStatusBadge(status)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProgress(progress || { id: 'new', user_id: client.user_id, step_id: step.id, status: 'pending', step } as UserProgress)}
                                  className="h-5 px-1"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p className="text-sm">Clique em "Configurar" para ver as etapas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Dialog para adicionar cliente */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
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
                    if (expandedCard !== client.user_id) {
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