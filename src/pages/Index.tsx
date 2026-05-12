import { Link } from "react-router-dom";
import { Users, FileText, ArrowRight, ClipboardList, Plus, Tags } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/lib/types";

/**
 * Dashboard com cards diferentes por perfil:
 * - Aluno: meus trabalhos + cadastrar
 * - Avaliador: trabalhos atribuídos
 * - Gestor: gestão completa
 */
const Index = () => {
  const { profile, role } = useAuth();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-[image:var(--gradient-hero)] p-10 text-primary-foreground shadow-[var(--shadow-card)]">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Olá, {profile?.nome ?? "bem-vindo"}!
        </h1>
        <p className="mt-3 max-w-2xl text-primary-foreground/90">
          {role === "aluno" && "Acompanhe e gerencie os trabalhos que você submeteu ao congresso."}
          {role === "avaliador" && "Visualize os trabalhos que foram atribuídos a você para avaliação."}
          {role === "gestor" && "Painel administrativo completo: avaliadores, trabalhos e distribuições."}
        </p>
        {role && (
          <p className="mt-2 text-sm text-primary-foreground/80">
            Perfil: <strong>{ROLE_LABEL[role]}</strong>
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {role === "aluno" && (
          <>
            <DashCard
              icon={<FileText className="h-5 w-5" />}
              title="Meus trabalhos"
              description="Visualize e edite os trabalhos que você submeteu."
              to="/trabalhos"
            />
            <DashCard
              icon={<Plus className="h-5 w-5" />}
              title="Submeter trabalho"
              description="Envie um novo trabalho para o congresso."
              to="/trabalhos/novo"
            />
            <DashCard
              icon={<Tags className="h-5 w-5" />}
              title="Categorias"
              description="Veja as categorias disponíveis no congresso."
              to="/categorias"
            />
          </>
        )}

        {role === "avaliador" && (
          <>
            <DashCard
              icon={<FileText className="h-5 w-5" />}
              title="Trabalhos atribuídos"
              description="Acesse os trabalhos para sua avaliação."
              to="/trabalhos"
            />
            <DashCard
              icon={<Tags className="h-5 w-5" />}
              title="Categorias"
              description="Veja as categorias do congresso."
              to="/categorias"
            />
          </>
        )}

        {role === "gestor" && (
          <>
            <DashCard
              icon={<Users className="h-5 w-5" />}
              title="Avaliadores"
              description="Gerencie os avaliadores do congresso."
              to="/avaliadores"
            />
            <DashCard
              icon={<FileText className="h-5 w-5" />}
              title="Trabalhos"
              description="Visualize todos os trabalhos submetidos."
              to="/trabalhos"
            />
            <DashCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="Atribuições"
              description="Distribua trabalhos aos avaliadores."
              to="/atribuicoes"
            />
          </>
        )}
      </section>
    </div>
  );
};

const DashCard = ({
  icon,
  title,
  description,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
}) => (
  <Card className="shadow-[var(--shadow-card)]">
    <CardHeader>
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild>
        <Link to={to}>
          Acessar <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  </Card>
);

export default Index;
