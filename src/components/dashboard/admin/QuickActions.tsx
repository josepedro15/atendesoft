import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  GitBranch, 
  FileText, 
  CreditCard, 
  Layers,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { componentStyles } from "@/lib/design-system";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  variant?: 'default' | 'outline' | 'secondary';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions = ({ actions }: QuickActionsProps) => {
  const navigate = useNavigate();

  const getColorStyles = (color?: string) => {
    switch (color) {
      case 'success':
        return 'bg-success hover:bg-success/90 text-white border-success/30 shadow-lg hover:shadow-xl';
      case 'warning':
        return 'bg-warning hover:bg-warning/90 text-white border-warning/30 shadow-lg hover:shadow-xl';
      case 'danger':
        return 'bg-destructive hover:bg-destructive/90 text-white border-destructive/30 shadow-lg hover:shadow-xl';
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary/30 shadow-lg hover:shadow-xl';
    }
  };

  return (
    <Card className={`${componentStyles.card.glass} border-primary/20`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              className={`h-auto p-6 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:scale-105 rounded-xl ${
                action.color ? getColorStyles(action.color) : 'bg-card hover:bg-card/80 border border-border'
              }`}
              onClick={() => navigate(action.route)}
            >
              <div className="h-12 w-12 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center">
                {action.icon}
              </div>
              <div>
                <div className="font-semibold text-base">{action.title}</div>
                <div className="text-sm opacity-80 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 