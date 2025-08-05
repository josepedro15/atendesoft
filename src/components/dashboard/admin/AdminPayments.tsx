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
import { Calendar, DollarSign, Edit, Plus, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

interface AvailableUser {
  user_id: string;
  full_name: string;
  company: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    overdue: 0
  });
  const { toast } = useToast();
  const { isAdmin, isInitialized } = useAuth();

  useEffect(() => {
    // Só buscar dados se for admin e já foi inicializado
    if (isAdmin && isInitialized && !dataFetched) {
      fetchPayments();
      fetchAvailableUsers();
      setDataFetched(true);
    }
  }, [isAdmin, isInitialized, dataFetched]);

  const fetchPayments = async () => {
    try {
      console.log('Buscando pagamentos...');
      setLoading(true);
      
      // Buscar pagamentos primeiro
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }

      // Buscar perfis dos usuários separadamente
      if (paymentsData && paymentsData.length > 0) {
        const userIds = [...new Set(paymentsData.map(p => p.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, company')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Erro ao buscar perfis:', profilesError);
        } else {
          // Combinar dados
          const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
          const enrichedPayments = paymentsData.map(payment => ({
            ...payment,
            user_profile: profilesMap.get(payment.user_id) || { full_name: 'Usuário não encontrado', company: 'N/A' }
          }));
          
          console.log('Pagamentos encontrados:', enrichedPayments.length, enrichedPayments);
          setPayments(enrichedPayments as any);
          
          // Calcular estatísticas
          const statsData = {
            pending: enrichedPayments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
            paid: enrichedPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
            overdue: enrichedPayments.filter((p: any) => p.status === 'overdue').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)
          };
          setStats(statsData);
        }
      } else {
        console.log('Nenhum pagamento encontrado');
        setPayments([]);
        setStats({ pending: 0, paid: 0, overdue: 0 });
      }



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

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Buscar todos os usuários com role 'user' (clientes)
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'user');

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
        setAvailableUsers([]);
        return;
      }

      if (userRolesData && userRolesData.length > 0) {
        const userIds = userRolesData.map(r => r.user_id);
        
        // Buscar perfis dos usuários
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, company')
          .in('user_id', userIds);

        if (!profilesError && profilesData) {
          setAvailableUsers(profilesData.map(profile => ({
            user_id: profile.user_id,
            full_name: profile.full_name || 'Nome não informado',
            company: profile.company || 'Empresa não informada'
          })));
        }
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários disponíveis:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreatePayment = async (paymentData: any) => {
    try {
      // Validar dados obrigatórios
      if (!paymentData.user_id || !paymentData.amount || !paymentData.due_date) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // Converter amount para número
      const amount = parseFloat(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Erro",
          description: "Valor deve ser um número positivo",
          variant: "destructive"
        });
        return;
      }

      const paymentToInsert = {
        user_id: paymentData.user_id,
        amount: amount,
        currency: paymentData.currency || 'BRL',
        status: paymentData.status || 'pending',
        due_date: paymentData.due_date,
        paid_date: paymentData.status === 'paid' ? paymentData.paid_date : null,
        description: paymentData.description || ''
      };

      const { error } = await supabase
        .from('payments')
        .insert(paymentToInsert);

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Pagamento criado com sucesso"
      });

      console.log('Pagamento criado, recarregando lista...');
      setIsCreateDialogOpen(false);
      await fetchPayments();
      console.log('Lista de pagamentos recarregada');
      
      // Forçar re-render da interface
      setPayments(prevPayments => [...prevPayments]);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento. Verifique se você tem permissão.",
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
      console.error('Erro ao marcar como pago:', error);
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
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Mostrar loading enquanto não foi inicializado
  if (!isInitialized) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-glass">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card-glass">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se é admin
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
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-glow text-primary">
              Gerenciamento de Pagamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie pagamentos e cobranças dos clientes
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glass border-yellow-300/30 bg-yellow-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(stats.pending, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-green-300/30 bg-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.paid, 'BRL')}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-red-300/30 bg-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(stats.overdue, 'BRL')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center p-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground">
                Clique em "Novo Pagamento" para criar o primeiro pagamento.
              </p>
            </div>
          ) : (
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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.user_profile?.full_name || 'N/A'}</TableCell>
                    <TableCell>{payment.user_profile?.company || 'N/A'}</TableCell>
                    <TableCell>{payment.description || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className={isOverdue(payment.due_date, payment.status) ? 'text-red-500' : ''}>
                      {formatDate(payment.due_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.paid_date ? formatDate(payment.paid_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {payment.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar pagamento */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Pagamento</DialogTitle>
          </DialogHeader>
          <PaymentForm
            onSubmit={handleCreatePayment}
            availableUsers={availableUsers}
            loadingUsers={loadingUsers}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar pagamento */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <PaymentForm
              payment={editingPayment}
              onSubmit={(data) => handleUpdatePayment(editingPayment.id, data)}
              availableUsers={availableUsers}
              loadingUsers={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PaymentForm = ({ 
  payment, 
  onSubmit,
  availableUsers,
  loadingUsers
}: { 
  payment?: Payment; 
  onSubmit: (data: any) => void;
  availableUsers: AvailableUser[];
  loadingUsers: boolean;
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
          disabled={loadingUsers}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingUsers ? "Carregando..." : "Selecione um cliente"} />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user) => (
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
            min="0"
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

      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {payment ? 'Atualizar' : 'Criar'} Pagamento
        </Button>
      </div>
    </form>
  );
};

export default AdminPayments;