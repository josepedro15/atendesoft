import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Layers, Edit, Plus, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration_months?: number;
  is_active: boolean;
  created_at: string;
}

interface ClientService {
  id: string;
  user_id: string;
  service_name: string;
  status: string;
  monthly_price: number;
  start_date: string;
  next_billing_date?: string;
  user_profile?: {
    full_name: string;
    company: string;
  };
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'client-services'>('services');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar serviços disponíveis
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Buscar serviços contratados pelos clientes
      const { data: clientServicesData, error: clientServicesError } = await supabase
        .from('client_services')
        .select(`
          *,
          profiles!inner(full_name, company)
        `)
        .order('created_at', { ascending: false });

      if (clientServicesError) throw clientServicesError;

      setServices(servicesData || []);
      setClientServices(clientServicesData as any || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: any) => {
    try {
      const { error } = await supabase
        .from('services')
        .insert(serviceData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso"
      });

      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o serviço",
        variant: "destructive"
      });
    }
  };

  const handleUpdateService = async (serviceId: string, serviceData: any) => {
    try {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso"
      });

      setEditingService(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço",
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso"
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço",
        variant: "destructive"
      });
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Serviço ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do serviço",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Serviços</h2>
          <p className="text-muted-foreground">Gerencie serviços disponíveis e contratações</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="card-glass border-primary/20">
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
            </DialogHeader>
            <ServiceForm onSubmit={handleCreateService} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Abas */}
      <div className="flex gap-4 border-b border-primary/20">
        <Button
          variant={activeTab === 'services' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('services')}
          className="gap-2"
        >
          <Layers className="h-4 w-4" />
          Serviços Disponíveis
        </Button>
        <Button
          variant={activeTab === 'client-services' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('client-services')}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Serviços Contratados
        </Button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'services' && (
        <Card className="card-glass border-primary/20">
          <CardHeader>
            <CardTitle>Serviços Disponíveis</CardTitle>
            <CardDescription>Lista de todos os serviços oferecidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Duração (meses)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {service.description || 'Sem descrição'}
                    </TableCell>
                    <TableCell>
                      {service.price ? 
                        `R$ ${service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        'Não definido'
                      }
                    </TableCell>
                    <TableCell>{service.duration_months || 'Indefinido'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => toggleServiceStatus(service.id, service.is_active)}
                        />
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(service.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'client-services' && (
        <Card className="card-glass border-primary/20">
          <CardHeader>
            <CardTitle>Serviços Contratados</CardTitle>
            <CardDescription>Serviços contratados pelos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Próxima Cobrança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientServices.map((clientService) => (
                  <TableRow key={clientService.id}>
                    <TableCell className="font-medium">
                      {clientService.user_profile?.full_name || 'Não informado'}
                    </TableCell>
                    <TableCell>{clientService.user_profile?.company || 'Não informado'}</TableCell>
                    <TableCell>{clientService.service_name}</TableCell>
                    <TableCell>
                      R$ {clientService.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={clientService.status === 'active' ? 'default' : 'secondary'}>
                        {clientService.status === 'active' ? 'Ativo' : clientService.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(clientService.start_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {clientService.next_billing_date ? 
                        new Date(clientService.next_billing_date).toLocaleDateString('pt-BR') : 
                        'Não definida'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="card-glass border-primary/20">
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSubmit={(data) => handleUpdateService(editingService.id, data)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ServiceForm = ({ 
  service, 
  onSubmit 
}: { 
  service?: Service; 
  onSubmit: (data: any) => void; 
}) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration_months: service?.duration_months || 0,
    is_active: service?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Serviço</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição detalhada do serviço..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label htmlFor="duration_months">Duração (meses)</Label>
          <Input
            id="duration_months"
            type="number"
            value={formData.duration_months}
            onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
            placeholder="0 para indefinido"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Serviço ativo</Label>
      </div>

      <Button type="submit" className="w-full">
        {service ? 'Atualizar' : 'Criar'} Serviço
      </Button>
    </form>
  );
};

export default AdminServices;