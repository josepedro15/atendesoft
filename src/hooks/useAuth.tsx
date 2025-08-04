import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
}

export interface UserRole {
  role: 'admin' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 useAuth: Iniciando...');
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 useAuth: Verificando sessão...');
        
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('🔄 useAuth: Sessão encontrada:', !!currentSession);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('🔄 useAuth: Usuário logado:', currentSession.user.email);
          
          // Buscar perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();

          if (!profileError && profileData) {
            console.log('🔄 useAuth: Perfil encontrado:', profileData.full_name);
            setProfile(profileData);
          } else {
            console.log('🔄 useAuth: Perfil não encontrado');
            setProfile(null);
          }

          // Buscar role do usuário
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id)
            .single();

          if (!roleError && roleData) {
            console.log('🔄 useAuth: Role encontrada:', roleData.role);
            setUserRole(roleData.role);
          } else {
            console.log('🔄 useAuth: Role não encontrada, usando padrão: user');
            setUserRole('user');
          }
        } else {
          console.log('🔄 useAuth: Nenhum usuário logado');
          setProfile(null);
          setUserRole('user');
        }
      } catch (error) {
        console.error('❌ useAuth: Erro:', error);
        setProfile(null);
        setUserRole('user');
      } finally {
        console.log('✅ useAuth: Inicialização concluída');
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Configurar listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 useAuth: Auth state changed:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Buscar dados do usuário
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', newSession.user.id)
            .single();

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', newSession.user.id)
            .single();

          setProfile(profileData);
          setUserRole(roleData?.role || 'user');
        } else {
          setProfile(null);
          setUserRole('user');
        }
        
        if (!isInitialized) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    );

    // Inicializar auth
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const isAdmin = userRole === 'admin';
  const isAuthenticated = !!user;

  console.log('🔄 useAuth: Estado atual:', { 
    isAdmin, 
    isInitialized, 
    isLoading, 
    isAuthenticated,
    userEmail: user?.email 
  });

  return {
    user,
    session,
    profile,
    userRole,
    isAdmin,
    isAuthenticated,
    isLoading,
    isInitialized,
    signOut
  };
};