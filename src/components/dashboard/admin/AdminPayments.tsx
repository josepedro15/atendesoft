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
import { Calendar, DollarSign, Edit, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  description?: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    company: string;
  };
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!inner(full_name, company)
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;

      setPayments(data as any || []);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert(paymentData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento criado com sucesso"
      });

      setIsCreateDialogOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePayment = async (paymentId: string, paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso"
      });

      setEditingPayment(null);
      fetchPayments();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento",
        variant: "destructive"
      });
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento marcado como pago"
      });

      fetchPayments();
    } catch (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o pagamento como pago",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      overdue: { label: 'Vencido', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'outline' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="text-center p-8">Carregando pagamentos...</div>;
  }

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalOverdue = payments
    .filter(p => isOverdue(p.due_date, p.status))
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Pagamentos</h2>
          <p className="text-muted-foreground">Gerencie pagamentos e cobranças dos clientes</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="card-glass border-primary/20">
            <DialogHeader>
              <DialogTitle>Criar Novo Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm onSubmit={handleCreatePayment} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pagamentos */}
      <Card className="card-glass border-primary/20">
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow 
                  key={payment.id}
                  className={isOverdue(payment.due_date, payment.status) ? 'bg-red-50/5' : ''}
                >
                  <TableCell className="font-medium">
                    {payment.user_profile?.full_name || 'Não informado'}
                  </TableCell>
                  <TableCell>{payment.user_profile?.company || 'Não informado'}</TableCell>
                  <TableCell>{payment.description || 'Sem descrição'}</TableCell>
                  <TableCell className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isOverdue(payment.due_date, payment.status) && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {payment.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaid(payment.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPayment(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingPayment && (
        <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
          <DialogContent className="card-glass border-primary/20">
            <DialogHeader>
              <DialogTitle>Editar Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm
              payment={editingPayment}
              onSubmit={(data) => handleUpdatePayment(editingPayment.id, data)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const PaymentForm = ({ 
  payment, 
  onSubmit 
}: { 
  payment?: Payment; 
  onSubmit: (data: any) => void; 
}) => {
  const [formData, setFormData] = useState({
    user_id: payment?.user_id || '',
    amount: payment?.amount || 0,
    currency: payment?.currency || 'BRL',
    status: payment?.status || 'pending',
    due_date: payment?.due_date || '',
    paid_date: payment?.paid_date || '',
    description: payment?.description || ''
  });

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, company');

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    
    // Remove paid_date se o status não for 'paid'
    if (submitData.status !== 'paid') {
      delete submitData.paid_date;
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="user_id">Cliente</Label>
        <Select
          value={formData.user_id}
          onValueChange={(value) => setFormData({ ...formData, user_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id}>
                {user.full_name} - {user.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <Label htmlFor="currency">Moeda</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
        </div>
      </div>

      {formData.status === 'paid' && (
        <div>
          <Label htmlFor="paid_date">Data do Pagamento</Label>
          <Input
            id="paid_date"
            type="date"
            value={formData.paid_date}
            onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do pagamento..."
        />
      </div>

      <Button type="submit" className="w-full">
        {payment ? 'Atualizar' : 'Criar'} Pagamento
      </Button>
    </form>
  );
};

export default AdminPayments;