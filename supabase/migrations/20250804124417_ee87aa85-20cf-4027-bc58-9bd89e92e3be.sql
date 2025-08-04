-- Create implementation steps table
CREATE TABLE public.implementation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user implementation progress table
CREATE TABLE public.user_implementation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_id UUID NOT NULL REFERENCES public.implementation_steps(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract files table
CREATE TABLE public.contract_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default implementation steps
INSERT INTO public.implementation_steps (step_number, title, description) VALUES
(1, 'Instalação da VPS', 'Configuração inicial do servidor virtual privado'),
(2, 'Instalação das dependências na VPS', 'Instalação de todas as dependências necessárias no servidor'),
(3, 'Configuração dos fluxos de trabalho no n8n', 'Setup dos workflows de automação no n8n'),
(4, 'Configuração dos prompts no n8n', 'Configuração de prompts de IA nos workflows'),
(5, 'Fase de testes internos', 'Testes internos da equipe técnica'),
(6, 'Fase de testes para o cliente', 'Testes com participação do cliente'),
(7, 'Automação em produção', 'Sistema ativo em produção após aprovação');

-- Enable Row Level Security
ALTER TABLE public.implementation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_implementation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for implementation_steps (readable by all authenticated users)
CREATE POLICY "Anyone can view implementation steps" 
ON public.implementation_steps 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage implementation steps" 
ON public.implementation_steps 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_implementation_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_implementation_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.user_implementation_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage progress" 
ON public.user_implementation_progress 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payments" 
ON public.payments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for contract_files
CREATE POLICY "Users can view their own contracts" 
ON public.contract_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contracts" 
ON public.contract_files 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage contracts" 
ON public.contract_files 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_implementation_steps_updated_at
BEFORE UPDATE ON public.implementation_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_implementation_progress_updated_at
BEFORE UPDATE ON public.user_implementation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_files_updated_at
BEFORE UPDATE ON public.contract_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();