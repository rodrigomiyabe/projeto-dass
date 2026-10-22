package com.dass.brindes.funcionario.dto;

import com.dass.brindes.utils.TamanhoCamiseta;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FuncionarioRequestValidationTest {
    static Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test void requestValidoNaoTemViolacoes() {
        var req = new FuncionarioRequest("123.456.789-09", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test void cpfInvalidoGeraViolacao() {
        var req = new FuncionarioRequest("111.111.111-11", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test void emailInvalidoGeraViolacao() {
        var req = new FuncionarioRequest("12345678909", "Ana Silva", "nao-e-email", TamanhoCamiseta.M, 38);
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test void calcadoForaDaFaixaGeraViolacao() {
        var fora1 = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 33);
        var fora2 = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 49);
        assertThat(validator.validate(fora1)).isNotEmpty();
        assertThat(validator.validate(fora2)).isNotEmpty();
    }

    @Test void nomeEmBrancoGeraViolacao() {
        var req = new FuncionarioRequest("12345678909", " ", "ana@example.com", TamanhoCamiseta.M, 38);
        assertThat(validator.validate(req)).isNotEmpty();
    }
}
