import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientService {
  id: string;
  service_name: string;
  description: string | null;
  monthly_price: number;
  start_date: string;
  next_billing_date: string | null;
  status: string;
  created_at: string;
}

const ServicesView = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ClientService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [user?.id]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('client_services')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inativo</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Layers className="h-5 w-5 text-primary" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="card-glass border-primary/20 animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-primary/20 rounded mb-2"></div>
            <div className="h-8 bg-primary/10 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-glow text-primary mb-2">
          Serviços Contratados
        </h1>
        <p className="text-muted-foreground">
          Visualize todos os seus serviços ativos
        </p>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.id} className="card-glass border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="text-foreground font-semibold">{service.service_name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground font-normal">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg glass">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(service.monthly_price)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg glass">
                    <Calendar className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-semibold text-foreground">
                        {formatDate(service.start_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg glass">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
                      <p className="font-semibold text-foreground">
                        {service.next_billing_date 
                          ? formatDate(service.next_billing_date)
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalhes específicos por tipo de serviço */}
                <div className="border-t border-primary/20 pt-4">
                  <h4 className="font-medium text-foreground mb-2">Detalhes do Serviço</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {service.service_name.toLowerCase().includes('automação') && (
                      <>
                        <p>• Implementação de automações com IA</p>
                        <p>• Integração com sistemas existentes</p>
                        <p>• Suporte técnico especializado</p>
                      </>
                    )}
                    {service.service_name.toLowerCase().includes('chatbot') && (
                      <>
                        <p>• Chatbot inteligente com IA</p>
                        <p>• Treinamento personalizado</p>
                        <p>• Relatórios de performance</p>
                      </>
                    )}
                    {service.service_name.toLowerCase().includes('crm') && (
                      <>
                        <p>• Integração com APIs e CRMs</p>
                        <p>• Sincronização de dados</p>
                        <p>• Dashboards personalizados</p>
                      </>
                    )}
                    {service.service_name.toLowerCase().includes('bi') && (
                      <>
                        <p>• Dashboards interativos</p>
                        <p>• Relatórios automatizados</p>
                        <p>• Análise de dados avançada</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-glass border-primary/20">
          <CardContent className="p-12 text-center">
            <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum serviço contratado
            </h3>
            <p className="text-muted-foreground">
              Seus serviços aparecerão aqui quando forem ativados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicesView;