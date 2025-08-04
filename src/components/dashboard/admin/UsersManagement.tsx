import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import UsersList from "./UsersList";
import UserForm from "./UserForm";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string;
    company: string;
    phone: string;
  };
  role?: {
    role: 'admin' | 'user';
  };
}

const UsersManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { 
    users, 
    loading, 
    error,
    createUser, 
    updateUser, 
    deleteUser 
  } = useUsers();

  const handleCreateUser = async (userData: any) => {
    const success = await createUser(userData);
    if (success) {
      setIsCreateDialogOpen(false);
    }
    return success;
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return false;
    const success = await updateUser(editingUser.id, userData);
    if (success) {
      setEditingUser(null);
    }
    return success;
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="text-destructive mb-2">Erro ao carregar usuários</div>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-glow text-primary">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários e suas permissões</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="card-glass border-primary/20 max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-glass border-primary/20">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
            {users.length > 0 && ` (${users.length} usuários)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="card-glass border-primary/20 max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UsersManagement;