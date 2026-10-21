package com.dass.brindes.funcionario.dto;

import com.dass.brindes.funcionario.TamanhoCamiseta;
import java.time.OffsetDateTime;

/**
 * Response payload representing a persisted {@code Funcionario}.
 */
public record FuncionarioResponse(
        Long id,
        String cpf,
        String nome,
        String email,
        TamanhoCamiseta tamanhoCamiseta,
        Integer tamanhoCalcado,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
