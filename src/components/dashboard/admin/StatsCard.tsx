import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { componentStyles, getStatusColor } from "@/lib/design-system";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  link?: string;
  linkText?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  link, 
  linkText,
  variant = 'default' 
}: StatsCardProps) => {
  const navigate = useNavigate();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success/30 bg-success/10 dark:border-success/20 dark:bg-success/5';
      case 'warning':
        return 'border-warning/30 bg-warning/10 dark:border-warning/20 dark:bg-warning/5';
      case 'danger':
        return 'border-destructive/30 bg-destructive/10 dark:border-destructive/20 dark:bg-destructive/5';
      default:
        return 'border-primary/20 bg-card/50 backdrop-blur-sm';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={`${componentStyles.card.glass} ${getVariantStyles()} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getIconColor()} bg-background/50 backdrop-blur-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-3">
            <ArrowUpRight 
              className={`h-4 w-4 mr-2 ${trend.isPositive ? 'text-success' : 'text-destructive rotate-180'}`} 
            />
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.value}% {trend.isPositive ? 'aumento' : 'diminuição'}
            </span>
          </div>
        )}
        {link && linkText && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-3 p-0 h-auto text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
            onClick={() => navigate(link)}
          >
            {linkText}
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 