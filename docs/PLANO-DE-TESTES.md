# Plano de Testes

Este documento lista todas as classes de teste criadas ao longo das Tasks
4-14, o que cada uma cobre, e o resultado **real** (não um placeholder) da
última execução de cada comando, capturado durante a Task 15.

## Backend (Java / JUnit 5)

### Testes unitários (Surefire, classes `*Test`)

| Classe | O que cobre |
|--------|-------------|
| `com.dass.brindes.BrindesApplicationTests` | Smoke test: o contexto Spring sobe sem erros. |
| `com.dass.brindes.validation.CpfUtilsTest` | Normalização de CPF (remove pontuação) e validação do dígito verificador real: CPF válido com/sem pontuação, dígito verificador errado, todos os dígitos iguais, tamanho errado, nulo/vazio. |
| `com.dass.brindes.funcionario.dto.FuncionarioRequestValidationTest` | Bean Validation do `FuncionarioRequest`: requisição válida sem violações, CPF inválido, e-mail inválido, calçado fora da faixa 34-48, nome em branco. |
| `com.dass.brindes.funcionario.FuncionarioServiceTest` | Regras de negócio do `FuncionarioService` com repositório mockado (Mockito): criação normaliza o CPF e persiste; criação com CPF duplicado lança exceção de conflito; criação com e-mail duplicado lança exceção de conflito; atualização ignora o próprio registro na checagem de duplicidade; busca por id inexistente lança 404; exclusão de id inexistente lança 404. |

### Testes de integração (Failsafe, classes `*IT`, contra PostgreSQL real via Testcontainers)

| Classe | O que cobre |
|--------|-------------|
| `com.dass.brindes.funcionario.FuncionarioRepositoryIT` | `FuncionarioRepository` contra um PostgreSQL real: salvar e recuperar um funcionário; `existsByCpf` detecta duplicidade; `existsByCpfAndIdNot` ignora o próprio registro. |
| `com.dass.brindes.funcionario.FuncionarioControllerIT` | Fluxo HTTP completo via `MockMvc` contra o PostgreSQL real (migrations Flyway aplicadas antes da suíte): criação com sucesso (201); CPF inválido (400); calçado fora da faixa (400); calçado nos limites exatos 34 e 48 (sucesso); CPF duplicado (409); e-mail duplicado (409); busca por id inexistente (404); atualização com sucesso (200); exclusão com sucesso (204); pesquisa combinando múltiplos filtros; pesquisa por CPF funciona com ou sem pontuação. |

Classes de suporte (não são testes em si, mas a infraestrutura usada pelos
testes de integração acima): `com.dass.brindes.support.PostgresIntegrationTest`
(classe base `@Transactional` + `@Testcontainers`, com rollback automático
por teste) e `com.dass.brindes.TestcontainersConfiguration` /
`com.dass.brindes.TestBrindesApplication` (infraestrutura gerada pelo
Spring Initializr para rodar a aplicação localmente contra um Postgres
Testcontainers via `mvn spring-boot:test-run`).

### Comando único para rodar tudo (unitários + integração)

Até esta task, `./mvnw test` **não** executava as classes `*IT` (convenção
padrão do Surefire, que ignora esse padrão de nome). Para resolver isso, o
`maven-failsafe-plugin` foi adicionado a `backend/pom.xml`
(sem versão explícita — herdada do `spring-boot-starter-parent:4.1.1`,
resolvida como `3.5.6`), com uma execução vinculada às fases
`integration-test` e `verify` e o padrão de inclusão default (`**/*IT.java`):

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <executions>
        <execution>
            <id>integration-test</id>
            <goals>
                <goal>integration-test</goal>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

A partir dessa mudança, o comando documentado em `README.md` para rodar a
suíte completa é:

```bash
cd backend
./mvnw clean verify
```

#### Resultado real da execução (Task 15)

Comando executado: `./mvnw clean verify`, em `backend/`, com o Docker
Desktop rodando (necessário para o Testcontainers subir o PostgreSQL
descartável).

```
[INFO]  T E S T S
[INFO] Running com.dass.brindes.BrindesApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 10.84 s -- in com.dass.brindes.BrindesApplicationTests
[INFO] Running com.dass.brindes.funcionario.dto.FuncionarioRequestValidationTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.173 s -- in com.dass.brindes.funcionario.dto.FuncionarioRequestValidationTest
[INFO] Running com.dass.brindes.funcionario.FuncionarioServiceTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.279 s -- in com.dass.brindes.funcionario.FuncionarioServiceTest
[INFO] Running com.dass.brindes.validation.CpfUtilsTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.010 s -- in com.dass.brindes.validation.CpfUtilsTest
[INFO]
[INFO] Results:
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
...
[INFO]  T E S T S
[INFO] Running com.dass.brindes.funcionario.FuncionarioControllerIT
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 12.25 s -- in com.dass.brindes.funcionario.FuncionarioControllerIT
[INFO] Running com.dass.brindes.funcionario.FuncionarioRepositoryIT
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.203 s -- in com.dass.brindes.funcionario.FuncionarioRepositoryIT
[INFO]
[INFO] Results:
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] --- failsafe:3.5.6:integration-test (integration-test) @ brindes-backend ---
[INFO] Skipping execution of surefire because it has already been run for this configuration
[INFO] --- failsafe:3.5.6:verify (default) @ brindes-backend ---
[INFO] --- failsafe:3.5.6:verify (integration-test) @ brindes-backend ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  46.335 s
```

**Resultado: `BUILD SUCCESS`.** Surefire rodou 19 testes unitários (0
falhas, 0 erros), Failsafe rodou 14 testes de integração (0 falhas, 0
erros) — total de **33 testes, todos passando**. Confirmado também pela
presença dos relatórios em `backend/target/surefire-reports/` (4 arquivos
`TEST-*.xml`, um por classe unitária) e `backend/target/failsafe-reports/`
(2 arquivos `TEST-*.xml`, um por classe `*IT`, mais `failsafe-summary.xml`).

Ambiente em que o comando foi executado: Java 25.0.4 (JDK local; o projeto
compila com `--release 21`), Maven 3.10.0 via wrapper, Docker 29.8.1 com
Docker Compose v5.5.1 disponível para o Testcontainers.

## Frontend (Angular / Jest)

| Arquivo de spec | O que cobre |
|------------------|-------------|
| `app.spec.ts` | Componente raiz `App`: criação do componente, ausência de toast sem mensagem de feedback, exibição do toast de sucesso com a classe correta, exibição do toast de erro com a classe correta, renderização do `router-outlet`. |
| `app.routes.spec.ts` | Roteamento: rota `/novo` carrega `FuncionarioFormComponent` em modo criação; rota vazia (`/`) carrega `FuncionarioListComponent`; rota `/editar/:id` carrega `FuncionarioFormComponent` com o funcionário resolvido. |
| `shared/cpf-validator.spec.ts` | Validador de CPF do frontend: `normalizarCpf` remove pontuação; `cpfEhValido` aceita CPF válido com/sem pontuação e rejeita dígito verificador errado/sequência repetida; `cpfValidator` (validador de formulário Angular) retorna erro para CPF inválido e `null` para válido. |
| `shared/feedback.service.spec.ts` | `FeedbackService`: `sucesso()` define mensagem com tipo sucesso; `erro()` define mensagem com tipo erro. |
| `funcionario/funcionario.service.spec.ts` | `FuncionarioService` (HTTP): `listar` envia os filtros como query params; `criar` faz `POST` com o corpo correto; `excluir` faz `DELETE` no id informado. |
| `funcionario/funcionario-form.component.spec.ts` | `FuncionarioFormComponent`: marca CPF inválido como inválido no formulário; marca calçado fora da faixa 34-48 como inválido; ao submeter formulário válido em modo criação chama `service.criar`, navega para `/` e emite evento `salvo`; cancelar navega para `/` e emite `cancelado` sem chamar o serviço. |
| `funcionario/funcionario-list.component.spec.ts` | `FuncionarioListComponent`: carrega e exibe a lista ao iniciar; exibe estado vazio sem resultados; exibe estado de erro quando a API falha; pesquisar chama `service.listar` com os filtros preenchidos; excluir só chama o serviço após confirmação, navega e mostra feedback de sucesso; `novo`/`editar` navegam para as rotas corretas. |

### Resultado real da execução (Task 15)

Comando executado: `npm test -- --watch=false`, em `frontend/`.

```
Test Suites: 7 passed, 7 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        4.963 s
```

**Resultado: 7 suítes / 27 testes, todos passando, 0 falhas.** (Os avisos
`ts-jest[config] TS151001` sobre `esModuleInterop` são apenas um aviso de
configuração do TypeScript, não afetam o resultado dos testes.)

### Build de produção (verificação adicional)

Comando executado: `npm run build`, em `frontend/`.

```
Initial chunk files | Names         |  Raw size | Estimated transfer size
main-4KHIOES4.js    | main          | 301.64 kB |                78.31 kB
styles-5INURTSO.css | styles        |   0 bytes |                 0 bytes

Application bundle generation complete. [2.668 seconds]
Output location: C:\particular\gerenciador-presente-dass\frontend\dist\frontend
```

**Resultado: build concluído com sucesso**, sem erros de compilação
TypeScript/template.

## E2E (Playwright, best-effort)

| Arquivo | O que cobre |
|---------|-------------|
| `e2e/funcionario.spec.ts` | Um cenário de ponta a ponta contra a aplicação real (frontend + backend + PostgreSQL rodando): cadastrar um funcionário pela UI, ver o toast de sucesso e a linha na lista; pesquisar pelo nome e confirmar que apenas esse registro aparece; editar o tamanho de camiseta e confirmar a atualização na lista; excluir o registro (aceitando o `confirm()` nativo) e confirmar que a linha desaparece. |

### Resultado real da execução (Task 14 — não re-executado nesta task)

Este teste **não foi re-executado durante a Task 15** (rodá-lo exige subir
os três serviços — Postgres, backend e frontend — simultaneamente, o que
estava fora do escopo desta task de documentação). O resultado abaixo é o
resultado real, documentado em `.superpowers/sdd/2026-10-21-gerenciador-presente-dass/task-14-report.md`,
da execução feita quando o teste foi escrito:

Comando executado: `npx playwright test`, em `e2e/`, com Postgres (Docker
Compose), backend (`./mvnw spring-boot:run`) e frontend (`npm start`)
rodando e respondendo (`200` confirmado via `curl` em
`http://localhost:8080/api/funcionarios` e `http://localhost:4200/`).

```
Running 1 test using 1 worker
  ok 1 [chromium] › funcionario.spec.ts:8:5 › cadastrar, pesquisar, editar e excluir um funcionário (2.2s)
1 passed (3.5s)
```

Repetido uma segunda vez para descartar instabilidade (o teste é
autocontido: cria e exclui seu próprio registro sintético):

```
Running 1 test using 1 worker
  ok 1 [chromium] › funcionario.spec.ts:8:5 › cadastrar, pesquisar, editar e excluir um funcionário (952ms)
1 passed (1.7s)
```

**Resultado: `1 passed` nas duas execuções, sem flakiness observada.**

## Resumo final

| Suíte | Comando | Resultado |
|-------|---------|-----------|
| Backend — unitário + integração | `cd backend && ./mvnw clean verify` | `BUILD SUCCESS` — 19 testes unitários + 14 de integração = 33 testes, 0 falhas |
| Frontend — unitário | `cd frontend && npm test -- --watch=false` | 7 suítes / 27 testes, 0 falhas |
| Frontend — build de produção | `cd frontend && npm run build` | build concluído sem erros |
| E2E (opcional/best-effort) | `cd e2e && npx playwright test` | `1 passed` (Task 14; não re-executado na Task 15) |
