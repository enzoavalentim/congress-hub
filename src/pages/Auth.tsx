import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABEL, type AppRole } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha precisa ter ao menos 6 caracteres").max(72),
});

const signupSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha precisa ter ao menos 6 caracteres").max(72),
  perfil: z.enum(["aluno", "avaliador", "gestor"]),
});

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Cadastro
  const [nome, setNome] = useState("");
  const [emailS, setEmailS] = useState("");
  const [senhaS, setSenhaS] = useState("");
  const [perfil, setPerfil] = useState<AppRole>("aluno");

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [session, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, senha });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid") ? "Email ou senha inválidos" : error.message,
      );
      return;
    }
    toast.success("Login realizado!");
    navigate("/", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ nome, email: emailS, senha: senhaS, perfil });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome: parsed.data.nome, perfil: parsed.data.perfil },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message.includes("registered")
          ? "Email já cadastrado"
          : error.message,
      );
      return;
    }
    toast.success("Conta criada! Você já pode entrar.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Congresso Acadêmico</h1>
            <p className="text-sm text-muted-foreground">Sistema de avaliação</p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>Acesse sua conta com email e senha.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-senha">Senha</Label>
                    <Input
                      id="login-senha"
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>
                  Cadastre-se como Aluno, Avaliador ou Gestor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome completo</Label>
                    <Input
                      id="signup-nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={emailS}
                      onChange={(e) => setEmailS(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-senha">Senha</Label>
                    <Input
                      id="signup-senha"
                      type="password"
                      value={senhaS}
                      onChange={(e) => setSenhaS(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <Select value={perfil} onValueChange={(v) => setPerfil(v as AppRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["aluno", "avaliador", "gestor"] as AppRole[]).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;