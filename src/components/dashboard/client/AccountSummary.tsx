import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, FileText, CheckCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContractInfo {
  id: string;
  start_date: string;
  status: string;
  monthly_price: number;
}

const AccountSummary = () => {
  const { user, profile } = useAuth();
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchContractInfo();
    }
  }, [user?.id]);

  const fetchContractInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, start_date, status, monthly_price')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar contrato:', error);
        return;
      }

      setContract(data);
    } catch (error) {
      console.error('Erro ao buscar dados do contrato:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Ativo', variant: 'default' as const, icon: CheckCircle },
      'pending': { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const, icon: X }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-glass border-primary/20 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-primary/20 rounded mb-2"></div>
              <div className="h-8 bg-primary/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-glow text-primary mb-2">
          Olá, {profile?.full_name || 'Cliente'}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle da AtendeSSoft
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Nome do Cliente */}
        <Card className="card-glass border-primary/20 hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliente
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {profile?.full_name || user?.email?.split('@')[0]}
            </div>
            {profile?.company && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.company}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Número do Contrato */}
        <Card className="card-glass border-primary/20 hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contrato
            </CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {contract?.id ? `#${contract.id.slice(-8).toUpperCase()}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Número do contrato
            </p>
          </CardContent>
        </Card>

        {/* Data de Início */}
        <Card className="card-glass border-primary/20 hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data de Início
            </CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {contract?.start_date ? formatDate(contract.start_date) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Início do serviço
            </p>
          </CardContent>
        </Card>

        {/* Status do Serviço */}
        <Card className="card-glass border-primary/20 hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            {contract?.status && (() => {
              const { icon: StatusIcon } = getStatusBadge(contract.status);
              return <StatusIcon className="h-4 w-4 text-primary" />;
            })()}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {contract?.status ? (
                <Badge variant={getStatusBadge(contract.status).variant}>
                  {getStatusBadge(contract.status).label}
                </Badge>
              ) : (
                <Badge variant="secondary">N/A</Badge>
              )}
            </div>
            {contract?.monthly_price && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(contract.monthly_price)}/mês
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSummary;