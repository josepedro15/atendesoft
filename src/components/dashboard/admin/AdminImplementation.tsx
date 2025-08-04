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

// Dados mockados para demonstração
const mockSteps: ImplementationStep[] = [
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

const mockClients: Client[] = [
  {
    user_id: '1',
    full_name: 'João Silva',
    company: 'Empresa ABC Ltda',
    email: 'joao@empresaabc.com',
    progress: [
      {
        id: '1',
        user_id: '1',
        step_id: '1',
        status: 'completed',
        started_at: '2024-01-01',
        completed_at: '2024-01-02',
        step: mockSteps[0]
      },
      {
        id: '2',
        user_id: '1',
        step_id: '2',
        status: 'completed',
        started_at: '2024-01-03',
        completed_at: '2024-01-05',
        step: mockSteps[1]
      },
      {
        id: '3',
        user_id: '1',
        step_id: '3',
        status: 'in_progress',
        started_at: '2024-01-06',
        step: mockSteps[2]
      }
    ]
  },
  {
    user_id: '2',
    full_name: 'Maria Santos',
    company: 'Tech Solutions',
    email: 'maria@techsolutions.com',
    progress: [
      {
        id: '4',
        user_id: '2',
        step_id: '1',
        status: 'completed',
        started_at: '2024-01-01',
        completed_at: '2024-01-03',
        step: mockSteps[0]
      },
      {
        id: '5',
        user_id: '2',
        step_id: '2',
        status: 'in_progress',
        started_at: '2024-01-04',
        step: mockSteps[1]
      }
    ]
  },
  {
    user_id: '3',
    full_name: 'Pedro Costa',
    company: 'Digital Marketing Pro',
    email: 'pedro@digitalmarketing.com',
    progress: [
      {
        id: '6',
        user_id: '3',
        step_id: '1',
        status: 'pending',
        step: mockSteps[0]
      }
    ]
  }
];

const AdminImplementation = () => {
  const [steps, setSteps] = useState<ImplementationStep[]>(mockSteps);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [editingProgress, setEditingProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
    }
  }, [isAdmin, toast]);

  const updateProgress = async (progressId: string, data: Partial<UserProgress>) => {
    try {
      // Simular atualização
      setClients(prevClients => 
        prevClients.map(client => ({
          ...client,
          progress: client.progress.map(progress => 
            progress.id === progressId 
              ? { ...progress, ...data }
              : progress
          )
        }))
      );

      toast({
        title: "Progresso Atualizado",
        description: "O status da implementação foi atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{clients.length} clientes</span>
        </div>
      </div>

      {/* Lista de Clientes */}
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