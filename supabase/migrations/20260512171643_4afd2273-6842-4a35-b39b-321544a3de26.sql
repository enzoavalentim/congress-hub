
-- 1. Enum de perfis
CREATE TYPE public.app_role AS ENUM ('aluno', 'avaliador', 'gestor');

-- 2. Tabela de perfis (dados públicos do usuário)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de roles (separada — segurança)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Função has_role (security definer evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 5. Trigger: ao criar um auth.user, cria profile + role baseado em raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::public.app_role, 'aluno'::public.app_role)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Vínculo de trabalhos com aluno autor
ALTER TABLE public.trabalhos
  ADD COLUMN aluno_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. Vínculo de avaliadores com usuário autenticado
ALTER TABLE public.avaliadores
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- 8. RLS profiles
CREATE POLICY "Users view own profile or gestor sees all" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 9. RLS user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestor manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- 10. Reescrever RLS de trabalhos
DROP POLICY IF EXISTS "público pode ver trabalhos" ON public.trabalhos;
DROP POLICY IF EXISTS "público pode inserir trabalhos" ON public.trabalhos;
DROP POLICY IF EXISTS "público pode atualizar trabalhos" ON public.trabalhos;
DROP POLICY IF EXISTS "público pode deletar trabalhos" ON public.trabalhos;

CREATE POLICY "view trabalhos by role" ON public.trabalhos
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'gestor')
    OR aluno_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.avaliadores av ON av.id = a.avaliador_id
      WHERE a.trabalho_id = trabalhos.id AND av.user_id = auth.uid()
    )
  );

CREATE POLICY "aluno insert own trabalho" ON public.trabalhos
  FOR INSERT TO authenticated
  WITH CHECK (
    (aluno_id = auth.uid() AND public.has_role(auth.uid(), 'aluno'))
    OR public.has_role(auth.uid(), 'gestor')
  );

CREATE POLICY "aluno update own or gestor" ON public.trabalhos
  FOR UPDATE TO authenticated
  USING (
    (aluno_id = auth.uid() AND public.has_role(auth.uid(), 'aluno'))
    OR public.has_role(auth.uid(), 'gestor')
  );

CREATE POLICY "gestor delete trabalhos" ON public.trabalhos
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));

-- 11. Reescrever RLS de avaliadores
DROP POLICY IF EXISTS "público pode ver avaliadores" ON public.avaliadores;
DROP POLICY IF EXISTS "público pode inserir avaliadores" ON public.avaliadores;
DROP POLICY IF EXISTS "público pode atualizar avaliadores" ON public.avaliadores;
DROP POLICY IF EXISTS "público pode deletar avaliadores" ON public.avaliadores;

CREATE POLICY "view avaliadores" ON public.avaliadores
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'gestor') OR user_id = auth.uid());

CREATE POLICY "gestor manage avaliadores" ON public.avaliadores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- 12. Reescrever RLS de categorias
DROP POLICY IF EXISTS "público pode ver categorias" ON public.categorias;
DROP POLICY IF EXISTS "público pode inserir categorias" ON public.categorias;
DROP POLICY IF EXISTS "público pode atualizar categorias" ON public.categorias;
DROP POLICY IF EXISTS "público pode deletar categorias" ON public.categorias;

CREATE POLICY "view categorias" ON public.categorias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gestor manage categorias" ON public.categorias
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- 13. Reescrever RLS de avaliacoes
DROP POLICY IF EXISTS "público pode ver avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "público pode inserir avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "público pode atualizar avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "público pode deletar avaliacoes" ON public.avaliacoes;

CREATE POLICY "view avaliacoes by role" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'gestor')
    OR EXISTS (SELECT 1 FROM public.avaliadores av WHERE av.id = avaliacoes.avaliador_id AND av.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = avaliacoes.trabalho_id AND t.aluno_id = auth.uid())
  );

CREATE POLICY "gestor insert avaliacoes" ON public.avaliacoes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "gestor delete avaliacoes" ON public.avaliacoes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "gestor or avaliador update avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'gestor')
    OR EXISTS (SELECT 1 FROM public.avaliadores av WHERE av.id = avaliacoes.avaliador_id AND av.user_id = auth.uid())
  );
