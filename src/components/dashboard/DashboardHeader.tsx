import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Sparkles, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, profile, userRole, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="glass border-b border-primary/20 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 glass rounded-full px-4 py-2 hover:bg-primary/10 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary text-lg">AtendeSoft</span>
        </Button>
        
        {isAdmin && (
          <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
            Admin
          </Badge>
        )}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56 card-glass border-primary/20" align="end">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium text-foreground">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
            <Badge 
              variant="outline" 
              className="self-start mt-1 text-xs border-primary/30 text-primary"
            >
              {isAdmin ? 'Administrador' : 'Cliente'}
            </Badge>
          </div>
          
          <DropdownMenuSeparator className="bg-primary/20" />
          
          <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-primary/20" />
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-destructive/10 text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;