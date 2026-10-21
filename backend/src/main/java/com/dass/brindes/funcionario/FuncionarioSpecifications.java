package com.dass.brindes.funcionario;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Builders for optional, composable {@link Specification} filters over {@link Funcionario}.
 */
public final class FuncionarioSpecifications {

	private FuncionarioSpecifications() {
	}

	public static Specification<Funcionario> cpfIgual(String cpfNormalizado) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("cpf"), cpfNormalizado);
	}

	public static Specification<Funcionario> nomeContem(String nome) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.like(criteriaBuilder.lower(root.get("nome")),
				"%" + nome.toLowerCase() + "%");
	}

	public static Specification<Funcionario> emailContem(String email) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.like(criteriaBuilder.lower(root.get("email")),
				"%" + email.toLowerCase() + "%");
	}

	public static Specification<Funcionario> tamanhoCamisetaIgual(TamanhoCamiseta tamanhoCamiseta) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("tamanhoCamiseta"), tamanhoCamiseta);
	}

	public static Specification<Funcionario> tamanhoCalcadoIgual(Integer tamanhoCalcado) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("tamanhoCalcado"), tamanhoCalcado);
	}

	public static Specification<Funcionario> combinar(String cpfNormalizado, String nome, String email,
			TamanhoCamiseta tamanhoCamiseta, Integer tamanhoCalcado) {
		List<Specification<Funcionario>> specs = new ArrayList<>();
		if (cpfNormalizado != null && !cpfNormalizado.isBlank()) {
			specs.add(cpfIgual(cpfNormalizado));
		}
		if (nome != null && !nome.isBlank()) {
			specs.add(nomeContem(nome));
		}
		if (email != null && !email.isBlank()) {
			specs.add(emailContem(email));
		}
		if (tamanhoCamiseta != null) {
			specs.add(tamanhoCamisetaIgual(tamanhoCamiseta));
		}
		if (tamanhoCalcado != null) {
			specs.add(tamanhoCalcadoIgual(tamanhoCalcado));
		}
		return Specification.allOf(specs);
	}

}
