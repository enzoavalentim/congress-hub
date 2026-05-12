import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/lib/types";

/**
 * Protege rotas. Se `roles` for informado, restringe a esses perfis.
 * Renderiza Outlet para uso aninhado em <Routes>.
 */
export const ProtectedRoute = ({ roles }: { roles?: AppRole[] }) => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};