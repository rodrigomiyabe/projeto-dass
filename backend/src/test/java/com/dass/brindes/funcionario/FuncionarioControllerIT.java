package com.dass.brindes.funcionario;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dass.brindes.funcionario.dto.FuncionarioRequest;
import com.dass.brindes.support.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@AutoConfigureMockMvc
class FuncionarioControllerIT extends PostgresIntegrationTest {
	@Autowired MockMvc mockMvc;
	@Autowired ObjectMapper objectMapper;

	@Test void criaFuncionarioComSucesso() throws Exception {
		var req = new FuncionarioRequest("123.456.789-09", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.cpf").value("12345678909"));
	}

	@Test void rejeitaCpfInvalidoCom400() throws Exception {
		var req = new FuncionarioRequest("111.111.111-11", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isBadRequest());
	}

	@Test void rejeitaCalcadoForaDaFaixaCom400() throws Exception {
		var abaixo = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 33);
		var acima = new FuncionarioRequest("98765432100", "Bia Souza", "bia@example.com", TamanhoCamiseta.M, 49);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(abaixo)))
			.andExpect(status().isBadRequest());
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(acima)))
			.andExpect(status().isBadRequest());
	}

	@Test void aceitaCalcadoNosLimites34E48() throws Exception {
		var min = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 34);
		var max = new FuncionarioRequest("98765432100", "Bia Souza", "bia@example.com", TamanhoCamiseta.M, 48);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(min)))
			.andExpect(status().isCreated());
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(max)))
			.andExpect(status().isCreated());
	}

	@Test void rejeitaCpfDuplicadoCom409() throws Exception {
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated());
		var duplicado = new FuncionarioRequest("123.456.789-09", "Outra Pessoa", "outra@example.com", TamanhoCamiseta.G, 40);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(duplicado)))
			.andExpect(status().isConflict());
	}

	@Test void rejeitaEmailDuplicadoCom409() throws Exception {
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated());
		var duplicado = new FuncionarioRequest("98765432100", "Outra Pessoa", "ana@example.com", TamanhoCamiseta.G, 40);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(duplicado)))
			.andExpect(status().isConflict());
	}

	@Test void buscaPorIdInexistenteRetorna404() throws Exception {
		mockMvc.perform(get("/api/funcionarios/99999")).andExpect(status().isNotFound());
	}

	@Test void atualizaFuncionarioComSucesso() throws Exception {
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		var resultadoCriacao = mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated())
			.andReturn();
		var criado = objectMapper.readTree(resultadoCriacao.getResponse().getContentAsString());
		long id = criado.get("id").asLong();

		var atualizacao = new FuncionarioRequest("12345678909", "Ana Silva Souza", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(put("/api/funcionarios/" + id).contentType(APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(atualizacao)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.nome").value("Ana Silva Souza"));
	}

	@Test void excluiFuncionarioComSucesso() throws Exception {
		var req = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		var resultadoCriacao = mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated())
			.andReturn();
		var criado = objectMapper.readTree(resultadoCriacao.getResponse().getContentAsString());
		long id = criado.get("id").asLong();

		mockMvc.perform(delete("/api/funcionarios/" + id)).andExpect(status().isNoContent());
		mockMvc.perform(get("/api/funcionarios/" + id)).andExpect(status().isNotFound());
	}

	@Test void pesquisaCombinandoFiltros() throws Exception {
		var ana = new FuncionarioRequest("12345678909", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		var bia = new FuncionarioRequest("98765432100", "Bia Souza", "bia@example.com", TamanhoCamiseta.G, 40);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(ana)))
			.andExpect(status().isCreated());
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(bia)))
			.andExpect(status().isCreated());

		mockMvc.perform(get("/api/funcionarios").param("nome", "Ana").param("tamanhoCamiseta", "M"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].nome").value("Ana Silva"));
	}

	@Test void pesquisaPorCpfFuncionaComOuSemPontuacao() throws Exception {
		var req = new FuncionarioRequest("123.456.789-09", "Ana Silva", "ana@example.com", TamanhoCamiseta.M, 38);
		mockMvc.perform(post("/api/funcionarios").contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isCreated());

		mockMvc.perform(get("/api/funcionarios").param("cpf", "123.456.789-09"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].cpf").value("12345678909"));

		mockMvc.perform(get("/api/funcionarios").param("cpf", "12345678909"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].cpf").value("12345678909"));
	}
}
