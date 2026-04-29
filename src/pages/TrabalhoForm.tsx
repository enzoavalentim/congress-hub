import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Categoria } from "@/lib/types";

const TrabalhoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    resumo: "",
    autores: "",
    categoria_id: "",
    data_submissao: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categorias").select("*").order("nome");
      setCategorias(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("trabalhos").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error("Trabalho não encontrado");
        navigate("/trabalhos");
        return;
      }
      setForm({
        titulo: data.titulo,
        resumo: data.resumo,
        autores: data.autores,
        categoria_id: data.categoria_id ?? "",
        data_submissao: data.data_submissao,
      });
    })();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      titulo: form.titulo,
      resumo: form.resumo,
      autores: form.autores,
      categoria_id: form.categoria_id || null,
      data_submissao: form.data_submissao,
    };
    if (isEdit) {
      const { error } = await supabase.from("trabalhos").update(payload).eq("id", id!);
      if (error) toast.error("Erro ao atualizar");
      else {
        toast.success("Trabalho atualizado");
        navigate("/trabalhos");
      }
    } else {
      const { error } = await supabase.from("trabalhos").insert(payload);
      if (error) toast.error("Erro ao cadastrar");
      else {
        toast.success("Trabalho cadastrado");
        navigate("/trabalhos");
      }
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/trabalhos">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>{isEdit ? "Editar trabalho" : "Novo trabalho"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autores">Autores</Label>
              <Input
                id="autores"
                required
                placeholder="Ex: João Silva, Maria Souza"
                value={form.autores}
                onChange={(e) => setForm({ ...form, autores: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumo">Resumo</Label>
              <Textarea
                id="resumo"
                required
                rows={6}
                value={form.resumo}
                onChange={(e) => setForm({ ...form, resumo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoria_id} onValueChange={(v) => setForm({ ...form, categoria_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data de submissão</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={form.data_submissao}
                  onChange={(e) => setForm({ ...form, data_submissao: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/trabalhos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrabalhoForm;