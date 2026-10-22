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

Decisão deliberada do solicitante, não um desvio de escopo. Mais detalhes
técnicos em `docs/ARQUITETURA.md`.

- **Backend**: Java 21, Spring Boot `4.1.1`, Maven Wrapper (não precisa de
  Maven instalado), PostgreSQL via Spring Data JPA + migrations Flyway.
- **Frontend**: Angular `22.2.3` (standalone, zoneless), via `npx` (não
  precisa de Angular CLI instalada), testes com Jest.
- **Banco de dados**: PostgreSQL via Docker Compose, credenciais em `.env`
  local (veja `.env.example`).

## Pré-requisitos

Há dois jeitos de rodar o projeto — escolha um:

- **Opção A — só Docker** (recomendado): sem instalar Java ou Node, precisa apenas de **Docker** `29.8.1`+
  com **Docker Compose** `v5.5.1`+ (`docker compose`, não o `docker-compose`
  legado).
- **Opção B — desenvolvimento local** (recomendado para alterar o código,
  com hot-reload): precisa de **JDK 21+** (ambiente usado para construir o
  projeto tinha o JDK 25.0.4; o projeto compila com `--release 21`, então
  qualquer JDK 21+ funciona), **Node.js** `v24.15.0`+ (com `npm 11.12.1`+) e
  **Docker** (só para o PostgreSQL). Não é necessário instalar Maven nem a
  Angular CLI globalmente — ambos são usados via wrapper/`npx`.

## Opção A — tudo via Docker (um único comando)

```bash
cp .env.example .env
docker compose up -d --build
```

Isso builda e sobe **três** containers: PostgreSQL (`postgres:16-alpine`),
o backend (`backend/Dockerfile`, build multi-stage com Maven + JRE 21) e o
frontend (`frontend/Dockerfile`, build multi-stage com Node + nginx servindo
os arquivos estáticos, com fallback de rota para o Angular Router). As
migrations do Flyway rodam automaticamente quando o backend sobe.

- Frontend: <http://localhost:4200>
- API: <http://localhost:8080/api/funcionarios>

Para ver os logs: `docker compose logs -f backend` (troque `backend` por
`frontend` ou `postgres`). Para parar tudo: `docker compose down` (ou
`docker compose down -v` para também apagar os dados do banco). Depois de
alterar código-fonte, suba de novo com `docker compose up -d --build` para
reconstruir as imagens.

## Opção B — desenvolvimento local (hot-reload)

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha os valores (ao menos troque `POSTGRES_PASSWORD` por
uma senha local sua). O arquivo `.env` nunca deve ser versionado — já está
no `.gitignore`.

### 2. Subir o PostgreSQL

O `docker-compose.yml` também define os serviços `backend`/`frontend` (usados
pela Opção A) — para rodar só o banco aqui na Opção B, especifique o serviço:

```bash
docker compose up -d postgres
```

Isso cria o container `postgres:16-alpine` com o banco/usuário/senha
definidos em `.env`, expõe a porta `${POSTGRES_PORT:-5432}` e mantém os
dados em um volume Docker nomeado (`postgres_data`), então os dados
sobrevivem a reinícios do container.

### 3. Rodar as migrations

As migrations Flyway são aplicadas **automaticamente** quando o backend
inicia — nenhum passo manual é necessário. Se quiser aplicá-las sem subir a
aplicação inteira: `cd backend && ./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/dass_brindes -Dflyway.user=dass_brindes -Dflyway.password=troque_esta_senha` (ajuste conforme o seu `.env`).

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

Para rodar: suba banco, backend e frontend como na Opção A ou na Opção B
acima (qualquer uma serve, desde que os três estejam respondendo), depois:

```bash
cd e2e
npm install                      # apenas na primeira vez
npx playwright install chromium  # apenas na primeira vez
npx playwright test
```

O resultado real da última execução está documentado em
`docs/PLANO-DE-TESTES.md`.

## Build de produção

Builds manuais, sem Docker (a Opção A já builda as imagens de produção
automaticamente):

```bash
cd backend && ./mvnw clean package   # gera o JAR executável em backend/target/
cd frontend && npm run build          # gera os estáticos em frontend/dist/frontend/
```

## Troubleshooting

- **Trocando da Opção A para a B (ou vice-versa)**: rode `docker compose down`
  antes — os dois usam as mesmas portas (8080/4200) e dão conflito se
  rodarem juntos.
- **Porta 5432/8080/4200 já em uso**: mude a porta em `.env`
  (`POSTGRES_PORT`), `application.yml` (`server.port`) ou
  `npm start -- --port 4300`, conforme o caso — e a porta publicada
  correspondente no `docker-compose.yml` se estiver usando a Opção A.
- **Docker não está rodando**: abra o Docker Desktop antes de
  `docker compose up` e antes de `./mvnw clean verify` (os testes de
  integração também precisam do Docker).
- **Erro de validação do Flyway ao iniciar o backend**: o esquema do banco
  está dessincronizado das migrations — derrube o volume
  (`docker compose down -v`) e suba de novo, perdendo os dados locais.
- **Frontend não encontra a API (erros de CORS)**: confirme que o backend
  está em `localhost:8080` e o frontend em `localhost:4200` — o CORS só
  libera essa origem exata (`backend/.../config/CorsConfig.java`).
