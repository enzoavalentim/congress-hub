export type Avaliador = {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  created_at: string;
};

export type Categoria = {
  id: string;
  nome: string;
  created_at: string;
};

export type Trabalho = {
  id: string;
  titulo: string;
  resumo: string;
  autores: string;
  categoria_id: string;
  data_submissao: string;
  created_at: string;
};