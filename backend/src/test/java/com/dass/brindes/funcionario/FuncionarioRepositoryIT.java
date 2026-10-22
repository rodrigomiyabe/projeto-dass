package com.dass.brindes.funcionario;

import static org.assertj.core.api.Assertions.assertThat;

import com.dass.brindes.entities.Funcionario;
import com.dass.brindes.repositories.FuncionarioRepository;
import com.dass.brindes.support.PostgresIntegrationTest;
import com.dass.brindes.utils.TamanhoCamiseta;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class FuncionarioRepositoryIT extends PostgresIntegrationTest {

	@Autowired
	FuncionarioRepository repository;

	@Test
	void salvaERecuperaFuncionario() {
		var salvo = repository.save(new Funcionario(null, "12345678909", "Ana Silva",
				"ana@example.com", TamanhoCamiseta.M, 38, null, null));
		assertThat(repository.findById(salvo.getId())).isPresent();
	}

	@Test
	void existsByCpfDetectaDuplicidade() {
		repository.save(new Funcionario(null, "12345678909", "Ana Silva",
				"ana@example.com", TamanhoCamiseta.M, 38, null, null));
		assertThat(repository.existsByCpf("12345678909")).isTrue();
		assertThat(repository.existsByEmail("ana@example.com")).isTrue();
	}

	@Test
	void existsByCpfAndIdNotIgnoraOProprioRegistro() {
		var salvo = repository.save(new Funcionario(null, "12345678909", "Ana Silva",
				"ana@example.com", TamanhoCamiseta.M, 38, null, null));
		assertThat(repository.existsByCpfAndIdNot("12345678909", salvo.getId())).isFalse();
		assertThat(repository.existsByCpfAndIdNot("12345678909", salvo.getId() + 1)).isTrue();
	}

}
