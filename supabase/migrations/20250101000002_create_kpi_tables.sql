-- Tabela para inputs manuais de KPIs
CREATE TABLE IF NOT EXISTS kpi_manual_inputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ref VARCHAR(7) NOT NULL, -- formato: YYYY-MM
  clientes_inicio INTEGER NOT NULL CHECK (clientes_inicio > 0),
  cancelados INTEGER NOT NULL CHECK (cancelados >= 0),
  renovados INTEGER NOT NULL CHECK (renovados >= 0),
  ltv DECIMAL(10,2) CHECK (ltv > 0),
  cac DECIMAL(10,2) CHECK (cac > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mes_ref)
);

-- Tabela para despesas mensais
CREATE TABLE IF NOT EXISTS despesas_mes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ref VARCHAR(7) NOT NULL, -- formato: YYYY-MM
  fixas DECIMAL(10,2) NOT NULL DEFAULT 0,
  variaveis DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mes_ref)
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_kpi_manual_inputs_updated_at 
  BEFORE UPDATE ON kpi_manual_inputs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_mes_updated_at 
  BEFORE UPDATE ON despesas_mes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE kpi_manual_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_mes ENABLE ROW LEVEL SECURITY;

-- Políticas para kpi_manual_inputs
CREATE POLICY "Admins can manage kpi_manual_inputs" ON kpi_manual_inputs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Políticas para despesas_mes
CREATE POLICY "Admins can manage despesas_mes" ON despesas_mes
  FOR ALL USING (has_role(auth.uid(), 'admin')); 