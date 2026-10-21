package com.dass.brindes.funcionario.dto;

import com.dass.brindes.funcionario.TamanhoCamiseta;
import com.dass.brindes.validation.Cpf;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating or updating a {@code Funcionario}.
 */
public record FuncionarioRequest(
        @NotBlank @Cpf String cpf,
        @NotBlank @Size(min = 2, max = 150) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @NotNull TamanhoCamiseta tamanhoCamiseta,
        @NotNull @Min(34) @Max(48) Integer tamanhoCalcado) {
}
