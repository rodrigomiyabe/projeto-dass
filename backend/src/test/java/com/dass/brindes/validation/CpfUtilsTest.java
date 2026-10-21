package com.dass.brindes.validation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CpfUtilsTest {
    @Test void normalizaRemovendoPontuacao() {
        assertThat(CpfUtils.normalizar("123.456.789-09")).isEqualTo("12345678909");
    }

    @Test void cpfValidoComPontuacaoEhAceito() {
        assertThat(CpfUtils.isValid("123.456.789-09")).isTrue();
    }

    @Test void cpfValidoSemPontuacaoEhAceito() {
        assertThat(CpfUtils.isValid("98765432100")).isTrue();
    }

    @Test void cpfComDigitoVerificadorErradoEhRejeitado() {
        assertThat(CpfUtils.isValid("12345678900")).isFalse();
    }

    @Test void cpfComTodosDigitosIguaisEhRejeitado() {
        assertThat(CpfUtils.isValid("11111111111")).isFalse();
    }

    @Test void cpfComTamanhoErradoEhRejeitado() {
        assertThat(CpfUtils.isValid("123456789")).isFalse();
    }

    @Test void cpfNuloOuVazioEhRejeitado() {
        assertThat(CpfUtils.isValid(null)).isFalse();
        assertThat(CpfUtils.isValid("")).isFalse();
    }
}
