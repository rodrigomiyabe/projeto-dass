# Gerenciador de Brindes - Dass

Aplicação web para cadastro, consulta, atualização e exclusão de
funcionários da Dass, com o objetivo de apoiar a organização da compra e
distribuição de brindes de fim de ano (camisetas e calçados personalizados
por tamanho).

## Resumo do projeto

O sistema expõe uma API REST (Java/Spring Boot) para gerenciar o cadastro de
funcionários — CPF, nome, e-mail, tamanho de camiseta e tamanho de calçado —
e uma interface web (Angular) que consome essa API para listar, pesquisar,
cadastrar, editar e excluir funcionários. Os dados são persistidos em
PostgreSQL, com o esquema de banco controlado por migrations Flyway.

## Funcionalidades

- **Cadastrar funcionário**: CPF (validado com dígito verificador real),
  nome, e-mail, tamanho de camiseta (PP/P/M/G/GG/XG) e tamanho de calçado
  (34 a 48).
- **Pesquisar funcionários**: filtros combináveis por CPF (com ou sem
  pontuação), nome (parcial), e-mail (parcial), tamanho de camiseta e
  tamanho de calçado, com paginação.
- **Editar funcionário**: atualização de todos os campos, com as mesmas
  validações do cadastro e checagem de duplicidade de CPF/e-mail
  desconsiderando o próprio registro.
- **Excluir funcionário**: remoção definitiva, com confirmação na interface.
- **Mensagens de erro claras**: respostas de validação trazem o campo e a
  mensagem específica; tentativas de duplicar CPF ou e-mail retornam um erro
  de conflito explicativo.

## Stack utilizada e divergência em relação ao PDF do desafio

O PDF original do desafio especificava **Node.js + Vue.js**. Por **instrução
explícita do solicitante**, que sobrepôs o PDF, este projeto foi construído
com uma stack diferente:

| Camada     | PDF original | Stack efetivamente usada                         |
|------------|---------------|---------------------------------------------------|
| Backend    | Node.js       | **Java 21 + Spring Boot 4.1.1**                    |
| Frontend   | Vue.js        | **Angular 22 (standalone components, zoneless)**   |
| Banco      | (não especificado) | **PostgreSQL 16**                            |

Essa divergência foi uma decisão deliberada e registrada, não um desvio de
escopo — o solicitante pediu explicitamente Java/Spring Boot no lugar de
Node.js e Angular no lugar de Vue.js.

Detalhes da stack:

- **Backend**: Java 21 como alvo de bytecode (`java.version` no `pom.xml`),
  Spring Boot `4.1.1` (a versão "latest stable" oferecida pelo Spring
  Initializr no momento em que o projeto foi gerado — mais nova do que se
  costuma esperar em tutoriais). Build via **Maven Wrapper** (`./mvnw` /
  `mvnw.cmd`), então **não é necessário ter o Maven instalado globalmente**.
  Persistência com Spring Data JPA, apenas **PostgreSQL** (nenhum banco em
  memória em produção), esquema controlado por **migrations Flyway**
  (`backend/src/main/resources/db/migration`), com
  `spring.jpa.hibernate.ddl-auto: validate` — ou seja, o Hibernate nunca
  altera o esquema; ele só valida que as entidades batem com o que o Flyway
  criou.
- **Frontend**: Angular `22.2.3`, com **componentes standalone** e
  **zoneless** (sem `zone.js`) — também mais novo do que normalmente se vê
  em tutoriais. Instalado e executado via `npx @angular/cli`, então
  **não é necessário ter a Angular CLI instalada globalmente**. Testes
  unitários com **Jest** (não Karma/Jasmine), para não depender de um
  Chrome real na máquina/CI.
- **Banco de dados**: **PostgreSQL** via Docker Compose
  (`docker-compose.yml` na raiz, imagem `postgres:16-alpine`), com
  credenciais lidas de um arquivo `.env` local (nenhum segredo real é
  versionado — veja `.env.example`).
- **Testes de integração do backend**: rodam contra um PostgreSQL real e
  descartável, levantado via **Testcontainers**, em vez de um banco falso
  em memória — ver `docs/ARQUITETURA.md` para a justificativa.

## Pré-requisitos

Versões confirmadas no ambiente de desenvolvimento usado para construir e
validar este projeto:

- **Java**: JDK 21 ou superior (o ambiente de desenvolvimento usado tinha o
  JDK 25.0.4 instalado; o projeto compila com `--release 21`, então qualquer
  JDK 21+ funciona).
- **Node.js**: `v24.15.0` (com `npm 11.12.1`).
- **Docker**: `29.8.1`, com **Docker Compose** `v5.5.1` (`docker compose`,
  não o `docker-compose` legado).
- Não é necessário instalar Maven nem a Angular CLI globalmente — ambos são
  usados via wrapper/`npx`, como descrito acima.

## Passo a passo de configuração

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha os valores (ao menos troque `POSTGRES_PASSWORD` por
uma senha local sua). O arquivo `.env` nunca deve ser versionado — já está
no `.gitignore`.

### 2. Subir o PostgreSQL

```bash
docker compose up -d
```

Isso cria o container `postgres:16-alpine` com o banco/usuário/senha
definidos em `.env`, expõe a porta `${POSTGRES_PORT:-5432}` e mantém os
dados em um volume Docker nomeado (`postgres_data`), então os dados
sobrevivem a reinícios do container.

### 3. Rodar as migrations

As migrations Flyway (em `backend/src/main/resources/db/migration`) são
aplicadas **automaticamente** quando o backend inicia (`spring.flyway.enabled:
true` em `application.yml`). Não é necessário nenhum passo manual no fluxo
normal.

Caso queira aplicar as migrations sem subir a aplicação inteira (por
exemplo, para inspecionar o banco antes de rodar o backend):

```bash
cd backend
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:5432/dass_brindes \
  -Dflyway.user=dass_brindes \
  -Dflyway.password=troque_esta_senha
```
(ajuste host/porta/usuário/senha/banco conforme o seu `.env`.)

### 4. Iniciar o backend

O backend lê as variáveis `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
`POSTGRES_USER` e `POSTGRES_PASSWORD` do ambiente do processo (não lê o
arquivo `.env` diretamente — exporte-as antes, ou use uma ferramenta como
`dotenv`/`direnv` se preferir). Exemplo no Git Bash:

```bash
cd backend
export POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_DB=dass_brindes POSTGRES_USER=dass_brindes POSTGRES_PASSWORD=troque_esta_senha
./mvnw spring-boot:run
```

O backend sobe em `http://localhost:8080`, com a API em
`http://localhost:8080/api/funcionarios` (ver `docs/API.md`).

### 5. Iniciar o frontend

```bash
cd frontend
npm install   # apenas na primeira vez / quando as dependências mudarem
npm start
```

O frontend sobe em `http://localhost:4200` e já está configurado (em
`src/environments/environment.ts`) para chamar a API em
`http://localhost:8080/api/funcionarios`. O backend libera CORS apenas para
essa origem (`http://localhost:4200`) — ver `docs/ARQUITETURA.md`.

## Rodar os testes

### Backend — testes unitários e de integração em um único comando

```bash
cd backend
./mvnw clean verify
```

Esse comando roda **tudo**: primeiro os testes unitários (Surefire,
classes `*Test`), depois os testes de integração (Failsafe, classes `*IT`,
que sobem um PostgreSQL real e descartável via Testcontainers — é
necessário o Docker estar rodando). Veja `docs/PLANO-DE-TESTES.md` para a
lista completa de classes de teste e o resultado real da última execução
deste comando.

Se quiser rodar **apenas** os testes unitários (mais rápido, não precisa de
Docker):

```bash
./mvnw test
```

> Atenção: `./mvnw test` **não** executa as classes `*IT` (o Surefire, por
> convenção, ignora esse padrão de nome). Para rodar unitários e de
> integração juntos use `./mvnw clean verify` (configurado neste projeto
> via `maven-failsafe-plugin` em `backend/pom.xml`) — esse é o comando
> recomendado e documentado como a forma oficial de rodar a suíte completa.

### Frontend — testes unitários (Jest)

```bash
cd frontend
npm test -- --watch=false
```

### E2E (opcional / best-effort)

Há um teste end-to-end com Playwright em `e2e/funcionario.spec.ts`,
cobrindo o fluxo completo cadastrar → pesquisar → editar → excluir contra a
aplicação real (backend + frontend + Postgres rodando). Ele é tratado como
**opcional e best-effort**: não faz parte do pipeline principal de testes,
mas pode ser executado manualmente.

Para rodar (todos os três serviços precisam estar de pé):

```bash
# 1. Banco
docker compose up -d

# 2. Backend (em um terminal, com as variáveis de ambiente exportadas)
cd backend
export POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_DB=dass_brindes POSTGRES_USER=dass_brindes POSTGRES_PASSWORD=troque_esta_senha
./mvnw spring-boot:run

# 3. Frontend (em outro terminal)
cd frontend
npm start

# 4. E2E (em outro terminal, depois que backend e frontend estiverem respondendo)
cd e2e
npm install          # apenas na primeira vez
npx playwright install chromium   # apenas na primeira vez
npx playwright test
```

O resultado real da última execução (Task 14) está documentado em
`docs/PLANO-DE-TESTES.md`.

## Build de produção

### Backend

```bash
cd backend
./mvnw clean package
```

Gera o JAR executável em `backend/target/`. (`./mvnw clean verify`, usado
para rodar os testes, também gera o mesmo artefato — `package` é um atalho
quando você só quer o JAR, sem rodar os testes de integração.)

### Frontend

```bash
cd frontend
npm run build
```

Gera os arquivos estáticos otimizados em `frontend/dist/frontend/`.

## Troubleshooting

- **Porta 5432 já em uso** (outro Postgres local rodando): mude
  `POSTGRES_PORT` no `.env` para outra porta (ex.: `5433`) antes de
  `docker compose up -d`, e ajuste `POSTGRES_HOST`/porta usados pelo backend
  na mesma proporção.
- **Porta 8080 já em uso**: pare o processo que a está usando, ou mude
  `server.port` em `backend/src/main/resources/application.yml`.
- **Porta 4200 já em uso**: `npm start -- --port 4300` (ou outra porta
  livre), e atualize `environment.ts` se necessário para apontar para a API
  correta.
- **Docker não está rodando / "Cannot connect to the Docker daemon"**:
  abra o Docker Desktop (ou inicie o serviço Docker) antes de
  `docker compose up -d` e antes de `./mvnw clean verify` (os testes de
  integração via Testcontainers também precisam do Docker disponível).
- **`./mvnw clean verify` falha tentando baixar a imagem `postgres:16-alpine`**:
  verifique conectividade de rede/Docker Hub; os testes de integração
  baixam essa imagem automaticamente na primeira execução.
- **Erro de validação do Flyway ao iniciar o backend** (ex.: "Validate
  failed"): normalmente indica que o esquema do banco está dessincronizado
  das migrations — em ambiente de desenvolvimento, a solução mais simples é
  derrubar o volume (`docker compose down -v`) e subir de novo
  (`docker compose up -d`), perdendo os dados locais.
- **Frontend não encontra a API (erros de CORS ou "Failed to fetch")**:
  confirme que o backend está rodando em `localhost:8080` e que o frontend
  está em `localhost:4200` — o backend só libera CORS para essa origem
  exata (`backend/src/main/java/com/dass/brindes/config/CorsConfig.java`).

## Limitações conhecidas

- **Checagem de duplicidade de CPF/e-mail com corrida teórica (TOCTOU)**:
  `criar`/`atualizar` primeiro verificam se o CPF/e-mail já existe
  (`existsByCpf`/`existsByEmail`) e só então salvam. Sob requisições
  concorrentes para o mesmo CPF/e-mail, as duas podem passar pela checagem
  antes que qualquer uma tenha salvo. Isso ainda não é impedido a nível de
  aplicação, mas não é mais um erro genérico de 500: a constraint `UNIQUE`
  do banco é o último degrau de defesa, e o `GlobalExceptionHandler`
  traduz a violação de integridade (`DataIntegrityViolationException`)
  para um `409` com a mensagem genérica "CPF ou e-mail já cadastrado" —
  sem expor o detalhe bruto do Postgres (que pode conter o CPF). A janela
  de corrida em si (ambas as requisições passarem pela checagem antes de
  qualquer salvar) continua existindo, mas o cliente sempre recebe um `409`
  limpo em vez de um `500`.
- **Paginação simples**: usa `Pageable` do Spring Data com um valor padrão
  explícito (`@PageableDefault(size = 50, sort = "nome")`, ordenação
  estável por nome quando `sort` não é informado). O frontend exibe um
  aviso "mostrando X de Y" e controles mínimos de avançar/voltar página
  (sem seletor de página nem salto direto para uma página arbitrária).
- **Sem autenticação/autorização**: qualquer pessoa com acesso à rede onde
  a API está exposta pode ler, criar, editar e excluir qualquer
  funcionário. Adequado para o escopo deste desafio (ambiente interno/
  demonstração), não para uso em produção exposta à internet sem uma camada
  de autenticação adicional.
- **Nenhum deploy em nuvem foi realizado**: não há link de demonstração
  publicamente acessível. O PDF do desafio marca o deploy em nuvem como
  opcional; a aplicação foi validada apenas localmente (Docker Compose +
  `./mvnw spring-boot:run` + `npm start`).

## Estrutura do repositório

```
.
├── backend/     # API REST em Java/Spring Boot (Maven Wrapper)
├── frontend/    # SPA em Angular (standalone, zoneless, Jest)
├── e2e/         # Teste end-to-end com Playwright (opcional/best-effort)
├── docs/
│   ├── ARQUITETURA.md       # Visão arquitetural do sistema
│   ├── API.md               # Contrato da API REST
│   └── PLANO-DE-TESTES.md   # Classes de teste e resultados reais de execução
├── docker-compose.yml   # PostgreSQL para desenvolvimento local
└── .env.example         # Modelo de variáveis de ambiente (sem segredos reais)
```
