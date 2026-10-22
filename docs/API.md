# API

API REST para gerenciamento de funcionários, exposta em
`http://localhost:8080/api/funcionarios` (porta/host de desenvolvimento;
ver `README.md`). Todas as requisições e respostas usam `application/json`.

Os exemplos abaixo usam CPFs sintéticos (matematicamente válidos, mas não
pertencentes a nenhuma pessoa real) usados nos testes automatizados deste
projeto: `12345678909` e `98765432100`.

## Modelo de dados

### `FuncionarioRequest` (corpo de `POST`/`PUT`)

| Campo             | Tipo     | Regras                                             |
|-------------------|----------|-----------------------------------------------------|
| `cpf`             | string   | obrigatório; CPF válido (dígitos verificadores reais), com ou sem pontuação |
| `nome`            | string   | obrigatório; 2 a 150 caracteres                     |
| `email`           | string   | obrigatório; formato de e-mail válido; até 150 caracteres |
| `tamanhoCamiseta` | string   | obrigatório; um de `PP`, `P`, `M`, `G`, `GG`, `XG`   |
| `tamanhoCalcado`  | integer  | obrigatório; entre `34` e `48`                       |

### `FuncionarioResponse` (corpo de resposta)

Os mesmos campos acima, mais:

| Campo        | Tipo             | Descrição                          |
|--------------|------------------|--------------------------------------|
| `id`         | integer (Long)   | identificador gerado pelo banco     |
| `createdAt`  | string (ISO-8601 com offset) | data/hora de criação   |
| `updatedAt`  | string (ISO-8601 com offset) | data/hora da última atualização |

O CPF é sempre devolvido **normalizado** (somente os 11 dígitos, sem
pontuação), independentemente de como foi enviado na requisição.

### `ApiError` (corpo de resposta para qualquer erro)

| Campo         | Tipo                     | Descrição                                      |
|---------------|--------------------------|--------------------------------------------------|
| `timestamp`   | string (ISO-8601 com offset) | momento em que o erro ocorreu              |
| `status`      | integer                  | código HTTP (`400`, `404`, `409`, `500`, ...)    |
| `error`       | string                   | nome do status HTTP (ex.: `"Bad Request"`)       |
| `message`     | string                   | mensagem legível do erro                         |
| `path`        | string                   | caminho da requisição que falhou                 |
| `fieldErrors` | array de `{campo, mensagem}` | populado apenas em erros de validação (400); vazio (`[]`) nos demais |

## Rotas

### `POST /api/funcionarios` — cadastrar

Cria um novo funcionário.

**Requisição**

```http
POST /api/funcionarios
Content-Type: application/json

{
  "cpf": "123.456.789-09",
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "tamanhoCamiseta": "M",
  "tamanhoCalcado": 38
}
```

**Resposta — `201 Created`** (com header `Location: /api/funcionarios/{id}`)

```json
{
  "id": 1,
  "cpf": "12345678909",
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "tamanhoCamiseta": "M",
  "tamanhoCalcado": 38,
  "createdAt": "2026-10-21T10:00:00-03:00",
  "updatedAt": "2026-10-21T10:00:00-03:00"
}
```

**Erro — `400 Bad Request`** (dados inválidos; exemplo com CPF inválido e
calçado fora da faixa)

```json
{
  "timestamp": "2026-10-21T10:00:00-03:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "path": "/api/funcionarios",
  "fieldErrors": [
    { "campo": "cpf", "mensagem": "CPF inválido" },
    { "campo": "tamanhoCalcado", "mensagem": "deve ser maior ou igual a 34" }
  ]
}
```

**Erro — `409 Conflict`** (CPF já cadastrado)

```json
{
  "timestamp": "2026-10-21T10:00:00-03:00",
  "status": 409,
  "error": "Conflict",
  "message": "Já existe um funcionário cadastrado com o CPF informado",
  "path": "/api/funcionarios",
  "fieldErrors": []
}
```

(o mesmo formato é usado quando o e-mail já está cadastrado, com a mensagem
`"Já existe um funcionário cadastrado com o e-mail informado"`.)

### `GET /api/funcionarios` — pesquisar (paginado)

Todos os parâmetros de consulta são opcionais e combináveis (AND).

| Parâmetro          | Tipo    | Observação                                             |
|--------------------|---------|----------------------------------------------------------|
| `cpf`              | string  | aceita com ou sem pontuação; busca por igualdade exata (após normalizar) |
| `nome`             | string  | busca parcial, sem diferenciar maiúsculas/minúsculas     |
| `email`            | string  | busca parcial, sem diferenciar maiúsculas/minúsculas     |
| `tamanhoCamiseta`  | string  | um de `PP`, `P`, `M`, `G`, `GG`, `XG`; busca por igualdade exata |
| `tamanhoCalcado`   | integer | busca por igualdade exata                                |
| `page`, `size`, `sort` | — | parâmetros padrão de paginação do Spring Data (`page` 0-based; `size` padrão `50`) |

**Requisição**

```http
GET /api/funcionarios?nome=ana&tamanhoCamiseta=M&page=0&size=20
```

**Resposta — `200 OK`**

```json
{
  "content": [
    {
      "id": 1,
      "cpf": "12345678909",
      "nome": "Ana Silva",
      "email": "ana@example.com",
      "tamanhoCamiseta": "M",
      "tamanhoCalcado": 38,
      "createdAt": "2026-10-21T10:00:00-03:00",
      "updatedAt": "2026-10-21T10:00:00-03:00"
    }
  ],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Erro — `500 Internal Server Error`** (limitação conhecida — ver
`README.md` "Limitações conhecidas"): um valor de `tamanhoCamiseta` que não
corresponde a nenhum dos enums válidos (ex.: `?tamanhoCamiseta=XYZ`) não é
tratado como erro de validação; cai no handler genérico e retorna 500:

```json
{
  "timestamp": "2026-10-21T10:00:00-03:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Erro interno. Tente novamente mais tarde.",
  "path": "/api/funcionarios",
  "fieldErrors": []
}
```

Esse caso não é alcançável pela interface web, cujo `<select>` só oferece
os valores válidos.

### `GET /api/funcionarios/{id}` — buscar por id

**Requisição**

```http
GET /api/funcionarios/1
```

**Resposta — `200 OK`**: mesmo formato de `FuncionarioResponse` do exemplo
de cadastro.

**Erro — `404 Not Found`**

```json
{
  "timestamp": "2026-10-21T10:00:00-03:00",
  "status": 404,
  "error": "Not Found",
  "message": "Funcionário não encontrado para o id 999",
  "path": "/api/funcionarios/999",
  "fieldErrors": []
}
```

### `PUT /api/funcionarios/{id}` — atualizar

Atualiza todos os campos do funcionário (não há atualização parcial).

**Requisição**

```http
PUT /api/funcionarios/1
Content-Type: application/json

{
  "cpf": "98765432100",
  "nome": "Ana Silva Souza",
  "email": "ana.souza@example.com",
  "tamanhoCamiseta": "G",
  "tamanhoCalcado": 40
}
```

**Resposta — `200 OK`**: `FuncionarioResponse` com os novos valores e
`updatedAt` atualizado.

**Erros**: mesmo formato de `400` (validação), `404` (id inexistente) e
`409` (CPF ou e-mail já usado por **outro** registro — a checagem de
duplicidade na atualização ignora o próprio registro sendo editado) descritos
acima.

### `DELETE /api/funcionarios/{id}` — excluir

**Requisição**

```http
DELETE /api/funcionarios/1
```

**Resposta — `204 No Content`** (sem corpo).

**Erro — `404 Not Found`**: mesmo formato do exemplo de busca por id.

## Resumo de códigos de status

| Código | Quando ocorre                                                        |
|--------|------------------------------------------------------------------------|
| `200`  | `GET`/`PUT` bem-sucedidos                                              |
| `201`  | `POST` bem-sucedido (cadastro criado)                                  |
| `204`  | `DELETE` bem-sucedido                                                  |
| `400`  | corpo de requisição inválido (`fieldErrors` populado)                  |
| `404`  | id informado não corresponde a nenhum funcionário cadastrado           |
| `409`  | CPF ou e-mail já cadastrado em outro registro                          |
| `500`  | erro interno não tratado — nunca expõe detalhes internos; inclui o caso conhecido de `tamanhoCamiseta` inválido na busca (ver acima) |
