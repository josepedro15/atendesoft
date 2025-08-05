import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (loading) return; // Previne múltiplas chamadas simultâneas
    
    try {
      setLoading(true);
      setError(null);
      
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('get-users', {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, loading]);

  const createUser = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso"
      });
      
      await fetchUsers(); // Recarrega a lista
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro", 
        description: "Não foi possível criar o usuário",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, toast]);

  const updateUser = useCallback(async (userId: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Updating user:', userId, 'with data:', userData);
      
      const session = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: { userId, ...userData },
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Update response:', data);

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso"
      });
      
      console.log('Refreshing users list...');
      await fetchUsers(); // Recarrega a lista
      console.log('Users list refreshed');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o usuário: ${errorMessage}`, 
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, toast]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return false;

    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso"
      });
      
      await fetchUsers(); // Recarrega a lista
      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive" 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, toast]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};