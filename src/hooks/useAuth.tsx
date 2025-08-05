import { useState, useEffect, useCallback } from "react";
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

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
      
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
        setProfile(null);
      } else {
        console.log('Profile data:', profileData);
        setProfile(profileData);
      }

      // Buscar role do usuário usando a função has_role
      try {
        console.log('Checking if user is admin...');
        const { data: isAdminData, error: isAdminError } = await supabase
          .rpc('has_role', {
            user_id: userId,
            role_name: 'admin'
          });

        if (isAdminError) {
          console.error('Erro ao verificar se é admin:', isAdminError);
          // Fallback: buscar diretamente da tabela
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

          if (roleError && roleError.code !== 'PGRST116') {
            console.error('Erro ao buscar role (fallback):', roleError);
            setUserRole('user');
          } else {
            console.log('Role data (fallback):', roleData);
            setUserRole(roleData?.role || 'user');
          }
        } else {
          console.log('Is admin check result:', isAdminData);
          setUserRole(isAdminData ? 'admin' : 'user');
        }
      } catch (roleError) {
        console.error('Erro ao buscar role (fallback):', roleError);
        setUserRole('user');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setProfile(null);
      setUserRole('user');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Verificar sessão existente primeiro
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('Current session:', currentSession ? 'exists' : 'null');
        
        if (!mounted) return;

        // Definir sessão e usuário imediatamente
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Marcar como inicializado imediatamente
        setIsLoading(false);
        setIsInitialized(true);
        
        if (currentSession?.user) {
          console.log('User found, fetching additional data...');
          
          // Buscar dados adicionais em background (não bloquear)
          fetchUserData(currentSession.user.id).catch(fetchError => {
            console.error('Error fetching user data:', fetchError);
            // Mesmo com erro ao buscar dados, o usuário está autenticado
            setProfile(null);
            setUserRole('user');
          });
        } else {
          console.log('No user found, setting defaults...');
          setProfile(null);
          setUserRole('user');
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        if (mounted) {
          setProfile(null);
          setUserRole('user');
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Configurar listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession ? 'session exists' : 'no session');
        
        if (!mounted) return;
        
        // Definir sessão e usuário imediatamente
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Marcar como inicializado imediatamente
        setIsLoading(false);
        setIsInitialized(true);
        
        if (newSession?.user) {
          console.log('New user session, fetching additional data...');
          
          // Buscar dados adicionais em background (não bloquear)
          fetchUserData(newSession.user.id).catch(fetchError => {
            console.error('Error fetching user data in listener:', fetchError);
            // Mesmo com erro ao buscar dados, o usuário está autenticado
            setProfile(null);
            setUserRole('user');
          });
        } else {
          console.log('No user session, clearing data...');
          setProfile(null);
          setUserRole('user');
        }
      }
    );

    // Inicializar auth
    initializeAuth();

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('Auth initialization timeout - forcing initialization');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 3000); // 3 segundos

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchUserData]);

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

  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  }, [user, fetchUserData]);

  const isAdmin = userRole === 'admin';
  const isAuthenticated = !!user && !!session;

  console.log('useAuth Debug:', {
    user: !!user,
    session: !!session,
    isAuthenticated,
    isAdmin,
    isLoading,
    isInitialized,
    userRole,
    profile: !!profile,
    userId: user?.id
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
    signOut,
    refreshUserData
  };
};