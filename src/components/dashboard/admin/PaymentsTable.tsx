import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: string;
  client: string;
  service: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  dueDate: string;
  paidDate?: string;
}

interface PaymentsTableProps {
  payments: Payment[];
}

const PaymentsTable = ({ payments }: PaymentsTableProps) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600 text-white">Pago</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600 text-white">Atrasado</Badge>;
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow 
                key={payment.id}
                className={isOverdue(payment.dueDate) && payment.status === 'pending' ? 'bg-red-50 dark:bg-red-950/20' : ''}
              >
                <TableCell className="font-medium">{payment.client}</TableCell>
                <TableCell>{payment.service}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  {getStatusBadge(payment.status)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell className={isOverdue(payment.dueDate) && payment.status === 'pending' ? 'text-red-600 font-medium' : ''}>
                  {formatDate(payment.dueDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/admin-payments')}
                  >
                    Atualizar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {payments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pagamento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsTable; 