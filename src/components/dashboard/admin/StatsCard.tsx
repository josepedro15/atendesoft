import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, GitBranch, CreditCard, DollarSign, Layers, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-primary/20 bg-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={`card-glass ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getIconColor()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <ArrowUpRight 
              className={`h-4 w-4 mr-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600 rotate-180'}`} 
            />
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}% {trend.isPositive ? 'aumento' : 'diminuição'}
            </span>
          </div>
        )}
        {link && linkText && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-xs text-primary hover:text-primary/80"
            onClick={() => navigate(link)}
          >
            {linkText}
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 