import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

// Loading placeholder
const LoadingCard = ({ title }: { title: string }) => (
  <Card className="border-primary/20 hover:border-primary/40 transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
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

// Lazy components with Suspense
export const LazyMRRCard = () => (
  <Suspense fallback={<LoadingCard title="MRR" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.MRRCard }))) />
  </Suspense>
);

export const LazyARRCard = () => (
  <Suspense fallback={<LoadingCard title="ARR" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.ARRCard }))) />
  </Suspense>
);

export const LazyChurnRetentionCard = () => (
  <Suspense fallback={<LoadingCard title="Churn & Retenção" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.ChurnRetentionCard }))) />
  </Suspense>
);

export const LazyLTVCACCard = () => (
  <Suspense fallback={<LoadingCard title="LTV/CAC" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.LTVCACCard }))) />
  </Suspense>
);

export const LazyDespesasFixasCard = () => (
  <Suspense fallback={<LoadingCard title="Despesas Fixas" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.DespesasFixasCard }))) />
  </Suspense>
);

export const LazyDespesasVariaveisCard = () => (
  <Suspense fallback={<LoadingCard title="Despesas Variáveis" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.DespesasVariaveisCard }))) />
  </Suspense>
);

export const LazyPrevisaoCaixaCard = () => (
  <Suspense fallback={<LoadingCard title="Previsão de Caixa" />}>
    <React.lazy(() => import('./AdvancedKPICards').then(module => ({ default: module.PrevisaoCaixaCard }))) />
  </Suspense>
); 