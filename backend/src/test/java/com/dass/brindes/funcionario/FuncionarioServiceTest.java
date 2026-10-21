package com.dass.brindes.funcionario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dass.brindes.funcionario.dto.FuncionarioRequest;
import com.dass.brindes.web.RecursoDuplicadoException;
import com.dass.brindes.web.RecursoNaoEncontradoException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {
	@Mock
	FuncionarioRepository repository;
	@InjectMocks
	FuncionarioService service;

	@Test
	void criarNormalizaCpfEPersiste() {
		when(repository.existsByCpf("12345678909")).thenReturn(false);
		when(repository.existsByEmail("ana@example.com")).thenReturn(false);
		when(repository.save(any())).thenAnswer(inv -> {
			Funcionario f = inv.getArgument(0);
			f.setId(1L);
			return f;
		});

		var req = new FuncionarioRequest("123.456.789-09", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		var resp = service.criar(req);

		assertThat(resp.cpf()).isEqualTo("12345678909");
		verify(repository).save(argThat(f -> f.getCpf().equals("12345678909")));
	}

	@Test
	void criarComCpfDuplicadoLancaExcecao() {
		when(repository.existsByCpf("12345678909")).thenReturn(true);
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		assertThatThrownBy(() -> service.criar(req)).isInstanceOf(RecursoDuplicadoException.class);
	}

	@Test
	void criarComEmailDuplicadoLancaExcecao() {
		when(repository.existsByCpf(any())).thenReturn(false);
		when(repository.existsByEmail("ana@example.com")).thenReturn(true);
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		assertThatThrownBy(() -> service.criar(req)).isInstanceOf(RecursoDuplicadoException.class);
	}

	@Test
	void atualizarIgnoraOProprioRegistroNaChecagemDeDuplicidade() {
		var existente = new Funcionario(1L, "12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38, null,
				null);
		when(repository.findById(1L)).thenReturn(Optional.of(existente));
		when(repository.existsByCpfAndIdNot("12345678909", 1L)).thenReturn(false);
		when(repository.existsByEmailAndIdNot("ana@example.com", 1L)).thenReturn(false);
		when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

		var req = new FuncionarioRequest("12345678909", "Ana Silva Souza", "ana@example.com", TamanhoCamiseta.G, 40);
		var resp = service.atualizar(1L, req);

		assertThat(resp.nome()).isEqualTo("Ana Silva Souza");
	}

	@Test
	void buscarPorIdInexistenteLancaExcecao() {
		when(repository.findById(99L)).thenReturn(Optional.empty());
		assertThatThrownBy(() -> service.buscarPorId(99L)).isInstanceOf(RecursoNaoEncontradoException.class);
	}

	@Test
	void excluirInexistenteLancaExcecao() {
		when(repository.existsById(99L)).thenReturn(false);
		assertThatThrownBy(() -> service.excluir(99L)).isInstanceOf(RecursoNaoEncontradoException.class);
	}
}
