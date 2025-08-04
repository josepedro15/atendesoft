import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Play, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImplementationStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
}

interface UserProgress {
  step_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

interface StepWithProgress extends ImplementationStep {
  progress?: UserProgress;
}

const ImplementationProgress = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchImplementationData();
    }
  }, [user?.id]);

  const fetchImplementationData = async () => {
    try {
      // Buscar todas as etapas
      const { data: stepsData, error: stepsError } = await supabase
        .from('implementation_steps')
        .select('*')
        .order('step_number');

      if (stepsError) {
        console.error('Erro ao buscar etapas:', stepsError);
        return;
      }

      // Buscar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('user_implementation_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', progressError);
      }

      // Combinar dados
      const stepsWithProgress: StepWithProgress[] = stepsData.map(step => ({
        ...step,
        progress: progressData?.find(p => p.step_id === step.id)
      }));

      setSteps(stepsWithProgress);
    } catch (error) {
      console.error('Erro ao buscar dados de implementação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em Andamento</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(s => s.progress?.status === 'completed').length;
    return steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card className="card-glass border-primary/20">
        <CardHeader>
          <div className="h-6 bg-primary/20 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-primary/10 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          Acompanhamento da Implementação
        </CardTitle>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Progresso Geral
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-4 p-4 rounded-lg glass border border-primary/10 hover:border-primary/30 transition-all"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                {getStatusIcon(step.progress?.status)}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px h-8 bg-primary/20 mt-2"></div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">
                  {step.step_number}. {step.title}
                </h4>
                {getStatusBadge(step.progress?.status)}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {step.description}
              </p>

              {/* Dates and notes */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {step.progress?.started_at && (
                  <span>
                    Iniciado: {formatDate(step.progress.started_at)}
                  </span>
                )}
                {step.progress?.completed_at && (
                  <span>
                    Concluído: {formatDate(step.progress.completed_at)}
                  </span>
                )}
              </div>

              {step.progress?.notes && (
                <div className="mt-2 p-2 bg-primary/5 rounded text-xs text-muted-foreground">
                  <strong>Notas:</strong> {step.progress.notes}
                </div>
              )}
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma implementação iniciada ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImplementationProgress;