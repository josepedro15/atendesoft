import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animated-bg">
        {/* Header Skeleton */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card-glass">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="card-glass">
                <div className="space-y-4">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 w-full bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;