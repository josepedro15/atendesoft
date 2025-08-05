import { useAuth } from "@/hooks/useAuth";

const DebugAuth = () => {
  const { 
    user, 
    session, 
    profile, 
    userRole, 
    isAdmin, 
    isAuthenticated, 
    isLoading, 
    isInitialized 
  } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">Debug Auth State:</div>
      <div className="space-y-1">
        <div>isLoading: {isLoading ? 'true' : 'false'}</div>
        <div>isInitialized: {isInitialized ? 'true' : 'false'}</div>
        <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>isAdmin: {isAdmin ? 'true' : 'false'}</div>
        <div>userRole: {userRole}</div>
        <div>user: {user ? 'exists' : 'null'}</div>
        <div>session: {session ? 'exists' : 'null'}</div>
        <div>profile: {profile ? 'exists' : 'null'}</div>
      </div>
    </div>
  );
};

export default DebugAuth; 