package com.dass.brindes.funcionario;

import com.dass.brindes.funcionario.dto.FuncionarioRequest;
import com.dass.brindes.funcionario.dto.FuncionarioResponse;
import com.dass.brindes.validation.CpfUtils;
import com.dass.brindes.web.RecursoDuplicadoException;
import com.dass.brindes.web.RecursoNaoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Business logic for managing {@link Funcionario} records.
 */
@Service
public class FuncionarioService {

	private final FuncionarioRepository repository;

	public FuncionarioService(FuncionarioRepository repository) {
		this.repository = repository;
	}

	public FuncionarioResponse criar(FuncionarioRequest request) {
		String cpfNormalizado = CpfUtils.normalizar(request.cpf());

		if (repository.existsByCpf(cpfNormalizado)) {
			throw new RecursoDuplicadoException("Já existe um funcionário cadastrado com o CPF informado");
		}
		if (repository.existsByEmail(request.email())) {
			throw new RecursoDuplicadoException("Já existe um funcionário cadastrado com o e-mail informado");
		}

		Funcionario funcionario = new Funcionario();
		funcionario.setCpf(cpfNormalizado);
		funcionario.setNome(request.nome());
		funcionario.setEmail(request.email());
		funcionario.setTamanhoCamiseta(request.tamanhoCamiseta());
		funcionario.setTamanhoCalcado(request.tamanhoCalcado());

		Funcionario salvo = repository.save(funcionario);
		return paraResponse(salvo);
	}

	public FuncionarioResponse atualizar(Long id, FuncionarioRequest request) {
		Funcionario funcionario = repository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado para o id " + id));

		String cpfNormalizado = CpfUtils.normalizar(request.cpf());

		if (repository.existsByCpfAndIdNot(cpfNormalizado, id)) {
			throw new RecursoDuplicadoException("Já existe um funcionário cadastrado com o CPF informado");
		}
		if (repository.existsByEmailAndIdNot(request.email(), id)) {
			throw new RecursoDuplicadoException("Já existe um funcionário cadastrado com o e-mail informado");
		}

		funcionario.setCpf(cpfNormalizado);
		funcionario.setNome(request.nome());
		funcionario.setEmail(request.email());
		funcionario.setTamanhoCamiseta(request.tamanhoCamiseta());
		funcionario.setTamanhoCalcado(request.tamanhoCalcado());

		Funcionario salvo = repository.save(funcionario);
		return paraResponse(salvo);
	}

	public FuncionarioResponse buscarPorId(Long id) {
		Funcionario funcionario = repository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado para o id " + id));
		return paraResponse(funcionario);
	}

	public void excluir(Long id) {
		if (!repository.existsById(id)) {
			throw new RecursoNaoEncontradoException("Funcionário não encontrado para o id " + id);
		}
		repository.deleteById(id);
	}

	public Page<FuncionarioResponse> pesquisar(String cpf, String nome, String email,
			TamanhoCamiseta tamanhoCamiseta, Integer tamanhoCalcado, Pageable pageable) {
		String cpfNormalizado = CpfUtils.normalizar(cpf);
		var specification = FuncionarioSpecifications.combinar(cpfNormalizado, nome, email, tamanhoCamiseta,
				tamanhoCalcado);
		return repository.findAll(specification, pageable).map(this::paraResponse);
	}

	private FuncionarioResponse paraResponse(Funcionario funcionario) {
		return new FuncionarioResponse(funcionario.getId(), funcionario.getCpf(), funcionario.getNome(),
				funcionario.getEmail(), funcionario.getTamanhoCamiseta(), funcionario.getTamanhoCalcado(),
				funcionario.getCreatedAt(), funcionario.getUpdatedAt());
	}

}
