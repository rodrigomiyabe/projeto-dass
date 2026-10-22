package com.dass.brindes.resources;

import com.dass.brindes.services.FuncionarioService;
import com.dass.brindes.utils.TamanhoCamiseta;
import com.dass.brindes.funcionario.dto.FuncionarioRequest;
import com.dass.brindes.funcionario.dto.FuncionarioResponse;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API for managing {@code Funcionario} records, exposed under {@code /api/funcionarios}.
 */
@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

	private final FuncionarioService service;

	public FuncionarioController(FuncionarioService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioRequest request) {
		FuncionarioResponse criado = service.criar(request);
		return ResponseEntity.created(URI.create("/api/funcionarios/" + criado.id())).body(criado);
	}

	@GetMapping
	public ResponseEntity<Page<FuncionarioResponse>> pesquisar(
			@RequestParam(required = false) String cpf,
			@RequestParam(required = false) String nome,
			@RequestParam(required = false) String email,
			@RequestParam(required = false) TamanhoCamiseta tamanhoCamiseta,
			@RequestParam(required = false) Integer tamanhoCalcado,
			@PageableDefault(size = 50, sort = "nome") Pageable pageable) {
		Page<FuncionarioResponse> resultado = service.pesquisar(cpf, nome, email, tamanhoCamiseta, tamanhoCalcado,
				pageable);
		return ResponseEntity.ok(resultado);
	}

	@GetMapping("/{id}")
	public ResponseEntity<FuncionarioResponse> buscarPorId(@PathVariable Long id) {
		return ResponseEntity.ok(service.buscarPorId(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<FuncionarioResponse> atualizar(@PathVariable Long id,
			@Valid @RequestBody FuncionarioRequest request) {
		return ResponseEntity.ok(service.atualizar(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Long id) {
		service.excluir(id);
		return ResponseEntity.noContent().build();
	}

}
