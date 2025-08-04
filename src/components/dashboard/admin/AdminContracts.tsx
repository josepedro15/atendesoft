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
import { FileText, Upload, Download, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  monthly_price: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    company: string;
  };
  service?: {
    name: string;
  };
}

interface ContractFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    company: string;
  };
}

const AdminContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractFiles, setContractFiles] = useState<ContractFile[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar contratos
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          *,
          profiles!inner(full_name, company),
          services(name)
        `)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Buscar arquivos de contratos
      const { data: filesData, error: filesError } = await supabase
        .from('contract_files')
        .select(`
          *,
          profiles!inner(full_name, company)
        `)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;

      setContracts(contractsData as any || []);
      setContractFiles(filesData as any || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (contractData: any) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .insert(contractData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso"
      });

      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o contrato",
        variant: "destructive"
      });
    }
  };

  const handleUpdateContract = async (contractId: string, contractData: any) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update(contractData)
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso"
      });

      setEditingContract(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contrato",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (userId: string, file: File) => {
    try {
      setUploadingFile(userId);

      // Upload do arquivo para o storage do Supabase
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Salvar referência no banco
      const { error: dbError } = await supabase
        .from('contract_files')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso"
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload do arquivo",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      active: { label: 'Ativo', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center p-8">Carregando contratos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Contratos</h2>
          <p className="text-muted-foreground">Gerencie contratos e arquivos dos clientes</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="card-glass border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Contrato</DialogTitle>
            </DialogHeader>
            <ContractForm onSubmit={handleCreateContract} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Contratos */}
      <Card className="card-glass border-primary/20">
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
          <CardDescription>Lista de todos os contratos</CardDescription>
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.user_profile?.full_name || 'Não informado'}
                  </TableCell>
                  <TableCell>{contract.user_profile?.company || 'Não informado'}</TableCell>
                  <TableCell>{contract.service?.name || 'Não informado'}</TableCell>
                  <TableCell>
                    R$ {contract.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    {contract.start_date ? new Date(contract.start_date).toLocaleDateString('pt-BR') : 'Não definida'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContract(contract)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <FileUploadButton
                        userId={contract.user_id}
                        onUpload={handleFileUpload}
                        loading={uploadingFile === contract.user_id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela de Arquivos */}
      <Card className="card-glass border-primary/20">
        <CardHeader>
          <CardTitle>Arquivos de Contratos</CardTitle>
          <CardDescription>Arquivos PDF anexados aos contratos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.file_name}
                  </TableCell>
                  <TableCell>{file.user_profile?.full_name || 'Não informado'}</TableCell>
                  <TableCell>{file.user_profile?.company || 'Não informado'}</TableCell>
                  <TableCell>
                    {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(file.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingContract && (
        <Dialog open={!!editingContract} onOpenChange={() => setEditingContract(null)}>
          <DialogContent className="card-glass border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Contrato</DialogTitle>
            </DialogHeader>
            <ContractForm
              contract={editingContract}
              onSubmit={(data) => handleUpdateContract(editingContract.id, data)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ContractForm = ({ 
  contract, 
  onSubmit 
}: { 
  contract?: Contract; 
  onSubmit: (data: any) => void; 
}) => {
  const [formData, setFormData] = useState({
    user_id: contract?.user_id || '',
    service_id: contract?.service_id || '',
    status: contract?.status || 'pending',
    monthly_price: contract?.monthly_price || 0,
    start_date: contract?.start_date || '',
    end_date: contract?.end_date || '',
    notes: contract?.notes || ''
  });

  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchUsersAndServices();
  }, []);

  const fetchUsersAndServices = async () => {
    try {
      const [usersResult, servicesResult] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, company'),
        supabase.from('services').select('id, name, price')
      ]);

      setUsers(usersResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

        <div>
          <Label htmlFor="service_id">Serviço</Label>
          <Select
            value={formData.service_id}
            onValueChange={(value) => setFormData({ ...formData, service_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - R$ {service.price}
                </SelectItem>
              ))}
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
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="monthly_price">Valor Mensal (R$)</Label>
          <Input
            id="monthly_price"
            type="number"
            step="0.01"
            value={formData.monthly_price}
            onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data de Início</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="end_date">Data de Término</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observações sobre o contrato..."
        />
      </div>

      <Button type="submit" className="w-full">
        {contract ? 'Atualizar' : 'Criar'} Contrato
      </Button>
    </form>
  );
};

const FileUploadButton = ({ 
  userId, 
  onUpload, 
  loading 
}: { 
  userId: string; 
  onUpload: (userId: string, file: File) => void; 
  loading: boolean; 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(userId, file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`file-upload-${userId}`}
        disabled={loading}
      />
      <label htmlFor={`file-upload-${userId}`}>
        <Button variant="outline" size="sm" asChild disabled={loading}>
          <span className="cursor-pointer">
            <Upload className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Upload PDF'}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default AdminContracts;