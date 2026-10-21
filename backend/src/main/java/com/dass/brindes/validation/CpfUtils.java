package com.dass.brindes.validation;

/**
 * Utility methods for normalizing and validating Brazilian CPF numbers.
 */
public final class CpfUtils {

    private CpfUtils() {
    }

    /**
     * Strips any non-digit characters from the given CPF string.
     *
     * @param cpf the raw CPF, possibly punctuated (e.g. "123.456.789-09")
     * @return the CPF containing only digits, or {@code null} if {@code cpf} is {@code null}
     */
    public static String normalizar(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }

    /**
     * Validates a CPF number, accepting raw or punctuated input.
     *
     * @param cpf the CPF to validate
     * @return {@code true} if the CPF is well-formed and its check digits are correct
     */
    public static boolean isValid(String cpf) {
        String normalizado = normalizar(cpf);
        if (normalizado == null || normalizado.length() != 11) {
            return false;
        }
        if (normalizado.chars().distinct().count() == 1) {
            return false;
        }

        int[] digitos = new int[11];
        for (int i = 0; i < 11; i++) {
            digitos[i] = normalizado.charAt(i) - '0';
        }

        int soma1 = 0;
        for (int i = 0; i < 9; i++) {
            soma1 += digitos[i] * (10 - i);
        }
        int resto1 = soma1 % 11;
        int digito1 = resto1 < 2 ? 0 : 11 - resto1;

        int soma2 = 0;
        for (int i = 0; i < 9; i++) {
            soma2 += digitos[i] * (11 - i);
        }
        soma2 += digito1 * 2;
        int resto2 = soma2 % 11;
        int digito2 = resto2 < 2 ? 0 : 11 - resto2;

        return digito1 == digitos[9] && digito2 == digitos[10];
    }
}
