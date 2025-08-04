import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  FileText, 
  MessageSquare,
  ArrowRight,
  DollarSign,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  type: 'payment_overdue' | 'implementation_delayed' | 'contract_pending' | 'support_ticket';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  client?: string;
  amount?: number;
  daysOverdue?: number;
  link?: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

const AlertsList = ({ alerts }: AlertsListProps) => {
  const navigate = useNavigate();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return <CreditCard className="h-4 w-4" />;
      case 'implementation_delayed':
        return <Settings className="h-4 w-4" />;
      case 'contract_pending':
        return <FileText className="h-4 w-4" />;
      case 'support_ticket':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 text-red-800 dark:text-red-200';
      case 'high':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 text-orange-800 dark:text-orange-200';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 text-blue-800 dark:text-blue-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-600 text-white">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600 text-white">Médio</Badge>;
      default:
        return <Badge className="bg-blue-600 text-white">Baixo</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getActionButton = (alert: Alert) => {
    switch (alert.type) {
      case 'payment_overdue':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/admin-payments')}
          >
            Ver Pagamentos
          </Button>
        );
      case 'implementation_delayed':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/admin-implementation')}
          >
            Ver Implementações
          </Button>
        );
      case 'contract_pending':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/admin-contracts')}
          >
            Ver Contratos
          </Button>
        );
      case 'support_ticket':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/support')}
          >
            Ver Tickets
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas e Notificações
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border ${getSeverityStyles(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm opacity-90">{alert.description}</p>
                    {alert.client && (
                      <p className="text-xs opacity-75 mt-1">
                        Cliente: {alert.client}
                      </p>
                    )}
                    {alert.amount && (
                      <p className="text-xs opacity-75">
                        Valor: {formatCurrency(alert.amount)}
                      </p>
                    )}
                    {alert.daysOverdue && (
                      <p className="text-xs opacity-75">
                        Atraso: {alert.daysOverdue} dias
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getActionButton(alert)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert.link && navigate(alert.link)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-xs">Tudo está funcionando normalmente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList; 