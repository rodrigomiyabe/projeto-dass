import { FormControl } from '@angular/forms';
import { cpfEhValido, cpfValidator, normalizarCpf } from './cpf-validator';

describe('cpf-validator', () => {
  it('normalizarCpf remove pontuação', () => {
    expect(normalizarCpf('123.456.789-09')).toBe('12345678909');
  });

  it('cpfEhValido aceita CPF válido com ou sem pontuação', () => {
    expect(cpfEhValido('123.456.789-09')).toBe(true);
    expect(cpfEhValido('98765432100')).toBe(true);
  });

  it('cpfEhValido rejeita dígito verificador errado e sequência repetida', () => {
    expect(cpfEhValido('12345678900')).toBe(false);
    expect(cpfEhValido('11111111111')).toBe(false);
  });

  it('cpfValidator retorna erro para controle com CPF inválido e null para válido', () => {
    const validator = cpfValidator();
    expect(validator(new FormControl('11111111111'))).toEqual({ cpfInvalido: true });
    expect(validator(new FormControl('123.456.789-09'))).toBeNull();
  });
});
