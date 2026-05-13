
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _perfil public.app_role;
BEGIN
  _perfil := COALESCE(
    (NEW.raw_user_meta_data->>'perfil')::public.app_role,
    'aluno'::public.app_role
  );

  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _perfil);

  IF _perfil = 'avaliador' THEN
    INSERT INTO public.avaliadores (nome, email, instituicao, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'instituicao', ''),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "gestor manage avaliadores" ON public.avaliadores;

CREATE POLICY "avaliador update own" ON public.avaliadores
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "gestor insert avaliadores" ON public.avaliadores
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "gestor update avaliadores" ON public.avaliadores
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'))
  WITH CHECK (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "gestor delete avaliadores" ON public.avaliadores
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));
