
CREATE POLICY "gestor delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'gestor'));
