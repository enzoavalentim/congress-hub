import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Aluno = {
  id: string;
  nome: string;
  email: string;
  created_at: string;
};

/**
 * Lista alunos cadastrados (profiles com role = 'aluno').
 * Apenas o gestor acessa esta página.
 */
const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Aluno | null>(null);

  const load = async () => {
    setLoading(true);
    // Busca user_ids com role 'aluno' e depois faz join manual com profiles
    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "aluno");

    if (rolesErr) {
      toast.error("Erro ao carregar alunos");
      setLoading(false);
      return;
    }

    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) {
      setAlunos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, email, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (error) toast.error("Erro ao carregar alunos");
    else setAlunos(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("profiles").delete().eq("id", toDelete.id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Aluno excluído");
      load();
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alunos</h1>
        <p className="text-sm text-muted-foreground">
          Alunos cadastrados no sistema. Novos alunos se cadastram pela tela de login.
        </p>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de cadastro</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : alunos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum aluno cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              alunos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setToDelete(a)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. <strong>{toDelete?.nome}</strong> será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Alunos;