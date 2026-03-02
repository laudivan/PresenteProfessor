# Controle de Frequência - Professor

Um web app em Node.js (Express) focado no registro temporário de presenças para turmas, mantendo um log separado em arquivos JSON localmente por aluno.

## Funcionalidades

- **Identificação da Aula:** Professor disponibiliza um código de 3 caracteres. (Deve existir no `.data/aulas.json` com `aberta: true`).
- **Identificação do Aluno:** Usa-se a Matrícula.
- **Cadastro Simples:** Alunos não encontrados completam seu registro na primeira vez (Nome, Nome Social opcional e Email).
- **Lista de Frequência JSON:** Registra data, hora (em ISOString) e código da aula.

## Como Executar Localmente

### Requisitos
- Node.js
- npm

### Rodando com Node.js

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   node server.js
   ```

3. Acesse no navegador:
   `http://localhost:3000`

## Executando com Podman

Este projeto conta com um `Containerfile` e um `docker-compose.yml` prontos para serem usados com **Podman** (ou Docker). O mapeamento de volumes está configurado para salvar os `.json` fora do container para persistência.

```bash
# Build e Spin Up
podman-compose up -d --build
```

Acesse via: `http://localhost:3000`

## Estrutura de Arquivos de Dados

Ao iniciar, uma pasta `data/` será gerada.

### `data/aulas.json`
Array de aulas abertas para presença:
```json
[
  {
    "codigo": "123",
    "data": "2026-03-02",
    "aberta": true
  }
]
```

### `data/alunos/{matricula}.aluno.json`
Perfis por matrícula:
```json
{
  "matricula": "123456",
  "nome": "João Silva",
  "nome_social": "",
  "email": "joao@email.com",
  "frequencia": [
    {
      "data_hora": "2026-03-02T12:00:00.000Z",
      "codigo_verificacao": "123"
    }
  ]
}
```

## Licença
Este projeto está licenciado sob a licença [MIT](LICENSE).
