import { NavLink, Outlet } from "react-router-dom";
import { GraduationCap, Users, FileText } from "lucide-react";

const navItem =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
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
              to="/avaliadores"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
              }
            >
              <Users className="h-4 w-4" />
              Avaliadores
            </NavLink>
            <NavLink
              to="/trabalhos"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`
              }
            >
              <FileText className="h-4 w-4" />
              Trabalhos
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;