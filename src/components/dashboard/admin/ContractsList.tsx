import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Contract {
  id: string;
  client: string;
  service: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  monthlyPrice: number;
  lastUpdate: string;
}

interface ContractsListProps {
  contracts: Contract[];
}

const ContractsList = ({ contracts }: ContractsListProps) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Ativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-600 text-white">Expirado</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-600 text-white">Cancelado</Badge>;
      default:
        return <Badge className="bg-yellow-600 text-white">Pendente</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contratos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div 
              key={contract.id} 
              className="flex items-center justify-between p-4 glass rounded-lg border border-primary/10"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  contract.status === 'active' ? 'bg-green-100 dark:bg-green-900' :
                  contract.status === 'expired' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                  {getStatusIcon(contract.status)}
                </div>
                <div>
                  <h4 className="font-medium">{contract.client}</h4>
                  <p className="text-sm text-muted-foreground">{contract.service}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(contract.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(contract.monthlyPrice)}/mês
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard/admin-contracts')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/admin-contracts')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {contracts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum contrato encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractsList; 