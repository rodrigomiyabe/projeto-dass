package com.dass.brindes.funcionario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FuncionarioRepository
		extends JpaRepository<Funcionario, Long>, JpaSpecificationExecutor<Funcionario> {

	boolean existsByCpf(String cpf);

	boolean existsByEmail(String email);

	boolean existsByCpfAndIdNot(String cpf, Long id);

	boolean existsByEmailAndIdNot(String email, Long id);

}
