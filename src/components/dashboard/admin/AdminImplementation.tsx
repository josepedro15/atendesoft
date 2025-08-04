import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Play, Pause, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  user_profile?: {
    full_name: string;
    company: string;
  };
}

const AdminImplementation = () => {
  const [steps, setSteps] = useState<ImplementationStep[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar etapas de implementação
      const { data: stepsData, error: stepsError } = await supabase
        .from('implementation_steps')
        .select('*')
        .order('step_number');

      if (stepsError) throw stepsError;

      // Buscar progresso dos usuários
      const { data: progressData, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select(`
          *,
          implementation_steps(*),
          profiles!inner(full_name, company)
        `);

      if (progressError) throw progressError;

      setSteps(stepsData || []);
      setUserProgress(progressData as any || []);
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

  const createProgressForUser = async (userId: string) => {
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
        description: "Progresso de implementação criado para o usuário"
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
        return <Badge variant="default" className="bg-green-600">Concluído</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-600">Em Progresso</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center p-8">Carregando dados de implementação...</div>;
  }

  const groupedProgress = userProgress.reduce((acc, progress) => {
    const userId = progress.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: progress.user_profile,
        steps: []
      };
    }
    acc[userId].steps.push(progress);
    return acc;
  }, {} as Record<string, { user: any; steps: UserProgress[] }>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Implementações</h2>
        <p className="text-muted-foreground">Acompanhe e atualize o progresso de implementação dos clientes</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedProgress).map(([userId, { user, steps }]) => (
          <Card key={userId} className="card-glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{user?.full_name || 'Usuário'}</span>
                <span className="text-sm text-muted-foreground">{user?.company}</span>
              </CardTitle>
              <CardDescription>
                Progresso da implementação - {steps.filter(s => s.status === 'completed').length} de {steps.length} etapas concluídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps
                  .sort((a, b) => a.step.step_number - b.step.step_number)
                  .map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(progress.status)}
                      <div>
                        <h4 className="font-medium">{progress.step.title}</h4>
                        <p className="text-sm text-muted-foreground">{progress.step.description}</p>
                        {progress.notes && (
                          <p className="text-sm text-blue-400 mt-1">Nota: {progress.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(progress.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProgress(progress)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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