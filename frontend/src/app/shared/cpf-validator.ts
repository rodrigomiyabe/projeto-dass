import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Strips any non-digit characters from the given CPF string.
 * Mirrors the backend's `CpfUtils.normalizar`.
 */
export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Validates a CPF number, accepting raw or punctuated input.
 * Mirrors the backend's `CpfUtils.isValid`.
 */
export function cpfEhValido(cpf: string): boolean {
  const normalizado = normalizarCpf(cpf);
  if (normalizado.length !== 11) {
    return false;
  }
  if (new Set(normalizado).size === 1) {
    return false;
  }

  const digitos = normalizado.split('').map((d) => Number(d));

  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += digitos[i] * (10 - i);
  }
  const resto1 = soma1 % 11;
  const digito1 = resto1 < 2 ? 0 : 11 - resto1;

  let soma2 = 0;
  for (let i = 0; i < 9; i++) {
    soma2 += digitos[i] * (11 - i);
  }
  soma2 += digito1 * 2;
  const resto2 = soma2 % 11;
  const digito2 = resto2 < 2 ? 0 : 11 - resto2;

  return digito1 === digitos[9] && digito2 === digitos[10];
}

/**
 * Validator function for use with Angular forms. Treats an empty value as
 * valid, leaving required-ness to `Validators.required`.
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) {
      return null;
    }
    return cpfEhValido(valor) ? null : { cpfInvalido: true };
  };
}
