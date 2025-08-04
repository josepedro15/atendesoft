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
        return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary';
    }
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              className={`h-auto p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-105 ${
                action.color ? getColorStyles(action.color) : ''
              }`}
              onClick={() => navigate(action.route)}
            >
              <div className="h-8 w-8 flex items-center justify-center">
                {action.icon}
              </div>
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 