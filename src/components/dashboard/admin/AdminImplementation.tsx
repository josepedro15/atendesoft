import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Play, Edit, Plus } from "lucide-react";
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

const AdminImplementation = () => {
  const [steps, setSteps] = useState<ImplementationStep[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingProgress, setEditingProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar etapas de implementação
      const { data: stepsData, error: stepsError } = await supabase
        .from('implementation_steps')
        .select('*')
        .order('step_number');

      if (stepsError) {
        console.error('Erro ao buscar etapas:', stepsError);
        throw stepsError;
      }

      // Buscar todos os clientes (usuários com role 'user')
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          company,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'user');

      if (clientsError) {
        console.error('Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }

      // Buscar emails dos usuários via Edge Function
      const userIds = clientsData?.map(c => c.user_id) || [];
      const session = await supabase.auth.getSession();
      const { data: emailsData, error: emailsError } = await supabase.functions.invoke('get-user-emails', {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });

      if (emailsError) {
        console.error('Erro ao buscar emails:', emailsError);
        // Continuar sem emails se houver erro
      }

      // Buscar progresso de implementação para todos os clientes
      const { data: progressData, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select(`
          *,
          implementation_steps(*)
        `)
        .in('user_id', userIds);

      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
        throw progressError;
      }

      // Combinar os dados
      const clientsWithProgress: Client[] = (clientsData || []).map(client => {
        const userProgress = (progressData || []).filter(p => p.user_id === client.user_id);
        const userEmail = emailsData?.users?.find(u => u.id === client.user_id)?.email || 'email@exemplo.com';
        
        return {
          user_id: client.user_id,
          full_name: client.full_name || 'Nome não informado',
          company: client.company || 'Empresa não informada',
          email: userEmail,
          progress: userProgress
        };
      });

      setSteps(stepsData || []);
      setClients(clientsWithProgress);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de implementação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProgressForClient = async (userId: string) => {
    try {
      const progressEntries = steps.map(step => ({
        user_id: userId,
        step_id: step.id,
        status: 'pending' as const
      }));

      const { error } = await supabase
        .from('user_implementation_progress')
        .insert(progressEntries);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Progresso de implementação criado para o cliente"
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao criar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o progresso de implementação",
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
        title: "Sucesso",
        description: "Status atualizado com sucesso"
      });

      fetchData();
      setEditingProgress(null);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
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

  if (loading) {
    return <div className="text-center p-8">Carregando dados de implementação...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-glow text-primary">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Implementações</h2>
        <p className="text-muted-foreground">Acompanhe e atualize o progresso de implementação dos clientes</p>
      </div>

      {clients.length === 0 ? (
        <Card className="card-glass border-primary/20">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">👥</div>
              <h3 className="text-xl font-semibold">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                Não há clientes cadastrados no sistema. 
                Os clientes aparecerão aqui quando forem criados.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => {
            const completedSteps = client.progress.filter(p => p.status === 'completed').length;
            const totalSteps = steps.length;
            const hasProgress = client.progress.length > 0;

            return (
              <Card key={client.user_id} className="card-glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-lg">{client.full_name}</span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {client.email} • {client.company}
                      </div>
                    </div>
                    <div className="text-right">
                      {hasProgress ? (
                        <div className="text-sm text-muted-foreground">
                          {completedSteps} de {totalSteps} etapas concluídas
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => createProgressForClient(client.user_id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Iniciar Implementação
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {hasProgress 
                      ? `Progresso: ${Math.round((completedSteps / totalSteps) * 100)}%`
                      : 'Implementação ainda não iniciada'
                    }
                  </CardDescription>
                </CardHeader>
                
                {hasProgress && (
                  <CardContent>
                    <div className="space-y-4">
                      {steps
                        .sort((a, b) => a.step_number - b.step_number)
                        .map((step) => {
                          const progress = client.progress.find(p => p.step_id === step.id);
                          
                          return (
                            <div key={step.id} className="flex items-center justify-between p-4 glass rounded-lg">
                              <div className="flex items-center gap-3">
                                {progress ? getStatusIcon(progress.status) : <Clock className="h-4 w-4 text-gray-500" />}
                                <div>
                                  <h4 className="font-medium">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                  {progress?.notes && (
                                    <p className="text-sm text-blue-400 mt-1">Nota: {progress.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={progress?.status === 'completed' ? 'bg-green-600 text-white px-2 py-1 rounded-full text-xs' : 
                                               progress?.status === 'in_progress' ? 'bg-blue-600 text-white px-2 py-1 rounded-full text-xs' : 
                                               'bg-gray-600 text-white px-2 py-1 rounded-full text-xs'}>
                                  {progress?.status === 'completed' ? 'Concluído' : 
                                   progress?.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                                </div>
                                {progress && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProgress(progress)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editingProgress && (
        <Dialog open={!!editingProgress} onOpenChange={() => setEditingProgress(null)}>
          <DialogContent className="card-glass border-primary/20">
            <DialogHeader>
              <DialogTitle>Atualizar Status da Etapa</DialogTitle>
            </DialogHeader>
            <ProgressForm
              progress={editingProgress}
              onSubmit={(data) => updateProgress(editingProgress.id, data)}
              onCancel={() => setEditingProgress(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ProgressForm = ({ 
  progress, 
  onSubmit, 
  onCancel 
}: { 
  progress: UserProgress; 
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    status: progress.status,
    notes: progress.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: any = {
      status: formData.status,
      notes: formData.notes
    };

    if (formData.status === 'in_progress' && !progress.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (formData.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (!progress.started_at) {
        updateData.started_at = new Date().toISOString();
      }
    }

    onSubmit(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Etapa: {progress.step.title}</Label>
        <p className="text-sm text-muted-foreground">{progress.step.description}</p>
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as any })}
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
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Adicione observações sobre esta etapa..."
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit">Atualizar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

export default AdminImplementation;