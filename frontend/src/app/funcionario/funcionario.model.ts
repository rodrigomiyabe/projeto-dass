export type TamanhoCamiseta = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';

export interface Funcionario {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  tamanhoCamiseta: TamanhoCamiseta;
  tamanhoCalcado: number;
}

export interface FuncionarioRequest {
  cpf: string;
  nome: string;
  email: string;
  tamanhoCamiseta: TamanhoCamiseta;
  tamanhoCalcado: number;
}

export interface FuncionarioFiltro {
  cpf?: string;
  nome?: string;
  email?: string;
  tamanhoCamiseta?: TamanhoCamiseta;
  tamanhoCalcado?: number;
}

export interface PaginaFuncionarios {
  content: Funcionario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
