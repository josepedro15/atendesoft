import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdvancedKPIs } from '@/hooks/useAdvancedKPIs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3,
  Plus,
  Edit
} from 'lucide-react';

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Componente Sparkline
const Sparkline = ({ data }: { data: number[] }) => {
  if (data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="60" height="20" className="mt-2">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-primary"
      />
    </svg>
  );
};

// Card MRR
export const MRRCard = () => {
  const { advancedKPIs, loading } = useAdvancedKPIs();
  const { mrr } = advancedKPIs;
  
  if (loading) {
    return (
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            MRR
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-glow text-primary">
            Carregando...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          MRR
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-glow text-primary">
          {formatCurrency(mrr.current)}
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {mrr.growth >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={mrr.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
            {mrr.growth >= 0 ? '+' : ''}{mrr.growth.toFixed(1)}% vs mês anterior
          </span>
        </div>
        <Sparkline data={mrr.sparkline} />
      </CardContent>
    </Card>
  );
};

// Card ARR
export const ARRCard = () => {
  const { advancedKPIs } = useAdvancedKPIs();
  const { arr } = advancedKPIs;
  
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          ARR
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-glow text-primary">
          {formatCurrency(arr.current)}
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {arr.growth >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={arr.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
            {arr.growth >= 0 ? '+' : ''}{arr.growth.toFixed(1)}% vs mês anterior
          </span>
        </div>
        <Sparkline data={arr.sparkline} />
      </CardContent>
    </Card>
  );
};

// Modal para Churn & Retenção
const ChurnModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: { clientesInicio: number; cancelados: number; renovados: number }) => void;
}) => {
  const [clientesInicio, setClientesInicio] = useState('');
  const [cancelados, setCancelados] = useState('');
  const [renovados, setRenovados] = useState('');

  const handleSave = () => {
    const data = {
      clientesInicio: parseInt(clientesInicio),
      cancelados: parseInt(cancelados),
      renovados: parseInt(renovados)
    };
    
    if (data.clientesInicio > 0 && data.cancelados >= 0 && data.renovados >= 0) {
      onSave(data);
      onClose();
      setClientesInicio('');
      setCancelados('');
      setRenovados('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Dados de Churn & Retenção</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientesInicio">Clientes no Início do Período</Label>
            <Input
              id="clientesInicio"
              type="number"
              min="1"
              value={clientesInicio}
              onChange={(e) => setClientesInicio(e.target.value)}
              placeholder="Ex: 100"
            />
          </div>
          <div>
            <Label htmlFor="cancelados">Clientes Cancelados</Label>
            <Input
              id="cancelados"
              type="number"
              min="0"
              value={cancelados}
              onChange={(e) => setCancelados(e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <Label htmlFor="renovados">Clientes Renovados</Label>
            <Input
              id="renovados"
              type="number"
              min="0"
              value={renovados}
              onChange={(e) => setRenovados(e.target.value)}
              placeholder="Ex: 95"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Salvar Dados
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Card Churn & Retenção
export const ChurnRetentionCard = () => {
  const { advancedKPIs, saveChurnData } = useAdvancedKPIs();
  const { churn } = advancedKPIs;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: { clientesInicio: number; cancelados: number; renovados: number }) => {
    await saveChurnData(data);
  };

  return (
    <>
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Churn & Retenção
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {churn.hasData ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Churn</span>
                <span className="text-lg font-semibold text-red-500">
                  {churn.rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Retenção</span>
                <span className="text-lg font-semibold text-green-500">
                  {churn.retention.toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Inserir dados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ChurnModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </>
  );
};

// Modal para LTV/CAC
const LTVCACModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: { ltv: number; cac: number }) => void;
}) => {
  const [ltv, setLtv] = useState('');
  const [cac, setCac] = useState('');

  const handleSave = () => {
    const data = {
      ltv: parseFloat(ltv),
      cac: parseFloat(cac)
    };
    
    if (data.ltv > 0 && data.cac > 0) {
      onSave(data);
      onClose();
      setLtv('');
      setCac('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Dados de LTV/CAC</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ltv">LTV (Lifetime Value)</Label>
            <Input
              id="ltv"
              type="number"
              min="0.01"
              step="0.01"
              value={ltv}
              onChange={(e) => setLtv(e.target.value)}
              placeholder="Ex: 1500.00"
            />
          </div>
          <div>
            <Label htmlFor="cac">CAC (Customer Acquisition Cost)</Label>
            <Input
              id="cac"
              type="number"
              min="0.01"
              step="0.01"
              value={cac}
              onChange={(e) => setCac(e.target.value)}
              placeholder="Ex: 300.00"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Salvar Dados
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Card LTV/CAC
export const LTVCACCard = () => {
  const { advancedKPIs, saveLTVCACData } = useAdvancedKPIs();
  const { ltvCac } = advancedKPIs;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: { ltv: number; cac: number }) => {
    await saveLTVCACData(data);
  };

  const getRatioBadge = (ratio: number) => {
    if (ratio > 3) return <Badge className="bg-green-500">Excelente</Badge>;
    if (ratio >= 1) return <Badge className="bg-yellow-500">Bom</Badge>;
    return <Badge className="bg-red-500">Crítico</Badge>;
  };

  return (
    <>
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            LTV/CAC
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {ltvCac.hasData ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">LTV</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(ltvCac.ltv)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CAC</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(ltvCac.cac)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Razão</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-primary">
                    {ltvCac.ratio.toFixed(2)}x
                  </span>
                  {getRatioBadge(ltvCac.ratio)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Inserir dados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <LTVCACModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </>
  );
};

// Modal para Despesas
const DespesasModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  currentData
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: { fixas: number; variaveis: number }) => void;
  currentData: { fixas: number; variaveis: number };
}) => {
  const [fixas, setFixas] = useState(currentData.fixas.toString());
  const [variaveis, setVariaveis] = useState(currentData.variaveis.toString());

  const handleSave = () => {
    const data = {
      fixas: parseFloat(fixas) || 0,
      variaveis: parseFloat(variaveis) || 0
    };
    
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Despesas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fixas">Despesas Fixas</Label>
            <Input
              id="fixas"
              type="number"
              min="0"
              step="0.01"
              value={fixas}
              onChange={(e) => setFixas(e.target.value)}
              placeholder="Ex: 5000.00"
            />
          </div>
          <div>
            <Label htmlFor="variaveis">Despesas Variáveis</Label>
            <Input
              id="variaveis"
              type="number"
              min="0"
              step="0.01"
              value={variaveis}
              onChange={(e) => setVariaveis(e.target.value)}
              placeholder="Ex: 2000.00"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Salvar Despesas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Card Despesas Fixas
export const DespesasFixasCard = () => {
  const { advancedKPIs, saveDespesasData } = useAdvancedKPIs();
  const { despesas } = advancedKPIs;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: { fixas: number; variaveis: number }) => {
    await saveDespesasData(data);
  };

  return (
    <>
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas Fixas
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-glow text-primary">
            {formatCurrency(despesas.fixas)}
          </div>
        </CardContent>
      </Card>
      
      <DespesasModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        currentData={despesas}
      />
    </>
  );
};

// Card Despesas Variáveis
export const DespesasVariaveisCard = () => {
  const { advancedKPIs, saveDespesasData } = useAdvancedKPIs();
  const { despesas } = advancedKPIs;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: { fixas: number; variaveis: number }) => {
    await saveDespesasData(data);
  };

  return (
    <>
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas Variáveis
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-glow text-primary">
            {formatCurrency(despesas.variaveis)}
          </div>
        </CardContent>
      </Card>
      
      <DespesasModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        currentData={despesas}
      />
    </>
  );
};

// Card Previsão de Caixa
export const PrevisaoCaixaCard = () => {
  const { advancedKPIs } = useAdvancedKPIs();
  const { previsaoCaixa } = advancedKPIs;
  
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Previsão de Caixa
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Receitas</span>
            <span className="text-lg font-semibold text-green-500">
              {formatCurrency(previsaoCaixa.receitas)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Despesas</span>
            <span className="text-lg font-semibold text-red-500">
              {formatCurrency(previsaoCaixa.despesas)}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Saldo Projetado</span>
              <span className={`text-xl font-bold ${previsaoCaixa.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(previsaoCaixa.saldo)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 