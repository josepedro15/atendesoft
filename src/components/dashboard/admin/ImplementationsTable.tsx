import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Settings, Clock, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Implementation {
  id: string;
  client: string;
  service: string;
  currentStep: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  lastUpdate: string;
}

interface ImplementationsTableProps {
  implementations: Implementation[];
}

const ImplementationsTable = ({ implementations }: ImplementationsTableProps) => {
  const navigate = useNavigate();

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
        return <Badge className="bg-green-600 text-white">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600 text-white">Em Progresso</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Últimas Implementações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Etapa Atual</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {implementations.map((implementation) => (
              <TableRow key={implementation.id}>
                <TableCell className="font-medium">{implementation.client}</TableCell>
                <TableCell>{implementation.service}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {getStatusIcon(implementation.status)}
                  {implementation.currentStep}
                </TableCell>
                <TableCell className="w-32">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={implementation.progress} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {implementation.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(implementation.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {implementation.lastUpdate}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/admin-implementation')}
                  >
                    Gerenciar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {implementations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma implementação encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImplementationsTable; 