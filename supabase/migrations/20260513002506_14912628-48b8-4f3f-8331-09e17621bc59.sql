
-- Corrige recursão infinita entre policies de trabalhos e avaliacoes
-- usando funções SECURITY DEFINER que bypassam RLS

CREATE OR REPLACE FUNCTION public.is_avaliador_de_trabalho(_user_id uuid, _trabalho_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.avaliacoes a
    JOIN public.avaliadores av ON av.id = a.avaliador_id
    WHERE a.trabalho_id = _trabalho_id
      AND av.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_aluno_dono_trabalho(_user_id uuid, _trabalho_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trabalhos t
    WHERE t.id = _trabalho_id AND t.aluno_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_avaliador_user(_user_id uuid, _avaliador_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.avaliadores av
    WHERE av.id = _avaliador_id AND av.user_id = _user_id
  )
$$;

-- Recriar policy de trabalhos sem subquery em avaliacoes
DROP POLICY IF EXISTS "view trabalhos by role" ON public.trabalhos;
CREATE POLICY "view trabalhos by role"
ON public.trabalhos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  OR aluno_id = auth.uid()
  OR public.is_avaliador_de_trabalho(auth.uid(), id)
);

-- Recriar policies de avaliacoes sem subquery direta em trabalhos
DROP POLICY IF EXISTS "view avaliacoes by role" ON public.avaliacoes;
CREATE POLICY "view avaliacoes by role"
ON public.avaliacoes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  OR public.is_avaliador_user(auth.uid(), avaliador_id)
  OR public.is_aluno_dono_trabalho(auth.uid(), trabalho_id)
);

DROP POLICY IF EXISTS "gestor or avaliador update avaliacoes" ON public.avaliacoes;
CREATE POLICY "gestor or avaliador update avaliacoes"
ON public.avaliacoes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  OR public.is_avaliador_user(auth.uid(), avaliador_id)
);
