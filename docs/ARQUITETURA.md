# Arquitetura

Este documento explica como as peças do sistema se encaixam, para quem não
conhece Java/Spring Boot ou Angular. O objetivo é dar uma visão de "o que
conversa com o quê e por quê", não um tutorial completo de cada framework.

## Visão geral: o caminho de uma requisição

```
┌──────────────┐      HTTP/JSON       ┌─────────────────────────┐
│  Navegador    │ ───────────────────▶ │  Angular SPA (frontend)  │
│  (usuário)    │ ◀─────────────────── │  localhost:4200          │
└──────────────┘                      └───────────┬──────────────┘
                                                   │ HTTP/JSON
                                                   │ (fetch/HttpClient)
                                                   ▼
                                   ┌───────────────────────────────┐
                                   │ Spring Boot REST Controller    │
                                   │ (FuncionarioController)        │
                                   │ localhost:8080/api/funcionarios│
                                   └───────────────┬─────────────────┘
                                                   │ chama
                                                   ▼
                                   ┌───────────────────────────────┐
                                   │ Service (FuncionarioService)   │
                                   │ regras de negócio:             │
                                   │ - normaliza/valida CPF          │
                                   │ - checa duplicidade de CPF/email│
                                   └───────────────┬─────────────────┘
                                                   │ usa
                                                   ▼
                                   ┌───────────────────────────────┐
                                   │ Repository (Spring Data JPA)   │
                                   │ FuncionarioRepository          │
                                   └───────────────┬─────────────────┘
                                                   │ SQL (Hibernate)
                                                   ▼
                                   ┌───────────────────────────────┐
                                   │ PostgreSQL                     │
                                   │ esquema criado/versionado      │
                                   │ pelo Flyway                    │
                                   └───────────────────────────────┘
```

Em palavras: o navegador carrega a SPA Angular, que roda inteiramente no
cliente. Toda ação do usuário (cadastrar, pesquisar, editar, excluir) dispara
uma chamada HTTP em JSON para a API REST do backend. O controller Spring
Boot recebe a requisição, delega para a camada de serviço (que concentra as
regras de negócio), que por sua vez usa o repositório Spring Data JPA para
ler/escrever no PostgreSQL. O esquema do banco nunca é criado ou alterado
pelo Hibernate — ele é inteiramente controlado pelas migrations Flyway.

## Camadas do backend

- **`FuncionarioController`**
  (`backend/src/main/java/com/dass/brindes/funcionario/FuncionarioController.java`):
  expõe as cinco operações REST em `/api/funcionarios` (criar, pesquisar,
  buscar por id, atualizar, excluir). Não contém regra de negócio — apenas
  traduz HTTP ↔ chamadas de serviço.
- **`FuncionarioService`**
  (`backend/src/main/java/com/dass/brindes/funcionario/FuncionarioService.java`):
  concentra as regras de negócio: normaliza o CPF (remove pontuação),
  verifica duplicidade de CPF e e-mail antes de salvar (lançando erro de
  conflito quando já existe), e traduz "não encontrado" em um erro 404.
- **`FuncionarioSpecifications`**: monta os filtros de pesquisa
  (`FuncionarioSpecifications.combinar`) como `Specification`s do Spring
  Data JPA combináveis — cada filtro (CPF, nome, e-mail, tamanho de
  camiseta, tamanho de calçado) só é aplicado quando o parâmetro
  correspondente foi informado.
- **`FuncionarioRepository`**: interface Spring Data JPA; a maior parte dos
  métodos (`existsByCpf`, `existsByEmail`, `findAll(Specification, Pageable)`
  etc.) é gerada automaticamente pelo Spring a partir do nome do método —
  não há SQL escrito à mão.
- **`Funcionario`**: a entidade JPA, mapeada para a tabela `funcionario`.
- **Validação de CPF** (`validation/Cpf.java`, `CpfValidator.java`,
  `CpfUtils.java`): uma anotação de validação Bean Validation customizada
  (`@Cpf`) que calcula os dígitos verificadores reais do CPF brasileiro
  (não é só checagem de formato) e rejeita sequências de dígitos repetidos
  (ex.: `111.111.111-11`).
- **`web/GlobalExceptionHandler`**: converte toda exceção lançada pelo
  service/controller em um corpo `ApiError` consistente — nunca deixa
  vazar stack trace ou mensagem interna de exceção não tratada para o
  cliente; o handler genérico (`Exception.class`) sempre devolve uma
  mensagem fixa e segura, logando a causa real só no servidor.

## Por que PostgreSQL + Flyway, e não um banco em memória

O `spring.jpa.hibernate.ddl-auto` está fixado em `validate`
(`backend/src/main/resources/application.yml`): o Hibernate nunca cria,
altera ou apaga tabelas — ele só confere, ao iniciar, que as entidades Java
batem com o esquema real do banco. Quem efetivamente possui e versiona o
esquema são as migrations Flyway, em
`backend/src/main/resources/db/migration` (ex.:
`V1__create_funcionario_table.sql`). Isso significa que o esquema de
produção é reproduzível e auditável: qualquer alteração de schema é um novo
arquivo de migration versionado no Git, nunca uma alteração "mágica" feita
pelo framework.

## Por que Testcontainers nos testes de integração (e não um banco falso em memória)

Os testes de integração do backend (classes `*IT`, como
`FuncionarioControllerIT` e `FuncionarioRepositoryIT`) rodam contra um
**PostgreSQL real**, porém **descartável**, levantado automaticamente pelo
Testcontainers dentro de um container Docker só para a duração da suíte de
testes (ver `backend/src/test/java/com/dass/brindes/support/PostgresIntegrationTest.java`).

A alternativa mais comum seria um banco em memória (H2, por exemplo)
configurado para simular o dialeto do PostgreSQL. Essa alternativa foi
descartada deliberadamente: um banco em memória não reproduz fielmente
comportamentos específicos do PostgreSQL (tipos de dado, comportamento de
constraints `UNIQUE`, funções, etc.), o que pode mascarar bugs que só
aparecem contra o banco real usado em produção. Rodar contra um PostgreSQL
real via Testcontainers custa um pouco mais de tempo de execução (o
container precisa subir), mas dá confiança real de que o código funciona
contra o banco que efetivamente será usado — inclusive as migrations
Flyway são aplicadas nesse container antes de cada suíte, exatamente como
em produção.

Cada classe de teste que estende `PostgresIntegrationTest` é `@Transactional`
e tem sua transação revertida (*rollback*) ao final de cada método de
teste, o que permite que vários testes compartilhem o mesmo container sem
colidir em constraints únicas (CPF/e-mail) — ver o comentário em
`PostgresIntegrationTest.java` para as duas consequências práticas disso ao
escrever novos testes (uso de `MockMvc` em vez de um cliente HTTP real, e
cuidado com testes que forçam uma violação de constraint do banco).

## Por que Jest no frontend (e não Karma/Jasmine)

O `ng new` do Angular tradicionalmente gera testes com Karma + Jasmine, que
exigem um navegador real (ou um Chrome headless) instalado para rodar os
testes. Este projeto usa **Jest** (`jest-preset-angular`) em vez disso: os
testes rodam em Node.js, usando `jsdom` para simular o DOM, sem depender de
um Chrome instalado na máquina ou no ambiente de CI. Isso simplifica a
execução local e em pipelines automatizados, ao custo de não exercitar o
código em um motor de navegador real — por isso o teste E2E com Playwright
(que usa um Chromium real) complementa essa lacuna no fluxo mais crítico da
aplicação (ver `docs/PLANO-DE-TESTES.md`).

O frontend também é **zoneless** (sem `zone.js`) e usa exclusivamente
**componentes standalone** (sem `NgModule`) — a forma mais recente e
recomendada de escrever aplicações Angular na versão usada neste projeto
(Angular 22).

## CORS

O backend restringe CORS explicitamente à origem do frontend de
desenvolvimento (`http://localhost:4200`,
`backend/src/main/java/com/dass/brindes/config/CorsConfig.java`) — nunca
usa `"*"`. Em um deploy real, essa origem precisaria ser atualizada para o
domínio público do frontend.

## Fluxo de dados de uma pesquisa (exemplo)

1. O componente Angular `FuncionarioListComponent` monta os filtros
   preenchidos pelo usuário e chama `FuncionarioService.listar(...)`
   (frontend), que faz um `GET /api/funcionarios?...` com os filtros como
   query params.
2. `FuncionarioController.pesquisar` recebe os parâmetros (todos
   opcionais) e delega para `FuncionarioService.pesquisar`.
3. O service normaliza o CPF (se informado) e monta uma `Specification`
   combinada via `FuncionarioSpecifications.combinar` — só os filtros
   efetivamente informados entram na consulta.
4. O repositório executa a consulta paginada (`Pageable`, página padrão de
   50 itens) contra o PostgreSQL.
5. O resultado (`Page<Funcionario>`) é mapeado para `Page<FuncionarioResponse>`
   e devolvido como JSON para o frontend, que renderiza a tabela.
