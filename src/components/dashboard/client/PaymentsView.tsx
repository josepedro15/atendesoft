import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date: string | null;
  description: string | null;
  created_at: string;
}

const PaymentsView = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    switch (status) {
      case 'paid':
        return {
          badge: <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pago</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        };
      case 'overdue':
        return {
          badge: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Vencido</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        };
      case 'pending':
        if (due < today) {
          return {
            badge: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Vencido</Badge>,
            icon: <AlertCircle className="h-4 w-4 text-red-500" />
          };
        }
        return {
          badge: <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>,
          icon: <Clock className="h-4 w-4 text-yellow-500" />
        };
      default:
        return {
          badge: <Badge variant="secondary">Cancelado</Badge>,
          icon: <Clock className="h-4 w-4 text-muted-foreground" />
        };
    }
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateTotals = () => {
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments.filter(p => {
      const today = new Date();
      const due = new Date(p.due_date);
      return (p.status === 'pending' && due < today) || p.status === 'overdue';
    }).reduce((sum, p) => sum + p.amount, 0);
    
    return { pending, paid, overdue };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="card-glass border-primary/20 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-primary/20 rounded mb-2"></div>
                <div className="h-8 bg-primary/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-glow text-primary mb-2">
          Pagamentos
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o status dos seus pagamentos
        </p>
      </div>

      {/* Resumo de Pagamentos */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pago
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(totals.paid)}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendente
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(totals.pending)}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencido
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totals.overdue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusInfo = getStatusBadge(payment.status, payment.due_date);
            
            return (
              <Card key={payment.id} className="card-glass border-primary/20 hover:border-primary/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {statusInfo.icon}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-foreground">
                          {payment.description || 'Pagamento de Serviço'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Venc: {formatDate(payment.due_date)}
                          </span>
                          {payment.paid_date && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Pago em: {formatDate(payment.paid_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground mb-2">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="flex items-center gap-3">
                        {statusInfo.badge}
                        {payment.status === 'pending' && (
                          <Button size="sm" className="btn-neon">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="card-glass border-primary/20">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum pagamento encontrado
            </h3>
            <p className="text-muted-foreground">
              Seus pagamentos aparecerão aqui quando estiverem disponíveis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentsView;