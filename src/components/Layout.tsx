import { NavLink, Outlet } from "react-router-dom";
import { GraduationCap, Users, FileText, Tags, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/types";

const navItem =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors";

const Layout = () => {
  const { profile, role, signOut } = useAuth();

  // Itens visíveis por perfil
  const showAvaliadores = role === "gestor";
  const showAtribuicoes = role === "gestor";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">Congresso Acadêmico</h1>
              <p className="text-xs text-muted-foreground">Gestão de Avaliações</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/trabalhos"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
              }
            >
              <FileText className="h-4 w-4" />
              Trabalhos
            </NavLink>
            <NavLink
              to="/categorias"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
              }
            >
              <Tags className="h-4 w-4" />
              Categorias
            </NavLink>
            {showAvaliadores && (
              <NavLink
                to="/avaliadores"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
                }
              >
                <Users className="h-4 w-4" />
                Avaliadores
              </NavLink>
            )}
            {showAtribuicoes && (
              <NavLink
                to="/atribuicoes"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
                }
              >
                <ClipboardList className="h-4 w-4" />
                Atribuições
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{profile.nome}</p>
                {role && (
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {ROLE_LABEL[role]}
                  </Badge>
                )}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;