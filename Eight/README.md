# Eight Ticket Bot

Este projeto é um bot para Discord focado em gerenciamento de tickets, utilizando Node.js, Discord.js e SQLite.

## Requisitos

- Node.js (v16 ou superior recomendado)
- npm (geralmente já vem com o Node.js)
- SQLite3 (o arquivo do banco já está incluso, mas a dependência npm é obrigatória)

## Instalação

1. **Clone o repositório ou coloque os arquivos em uma pasta.**

2. **Abra o terminal na pasta do projeto.**

3. **Instale as dependências:**

```bash
npm install discord.js sqlite3
```

Se você tiver um arquivo `package.json`, rode apenas:
```bash
npm install
```

4. **Configure o arquivo de ambiente (caso necessário):**

- Crie um arquivo `.env` com o seu token do bot:
  ```env
  DISCORD_TOKEN=seu_token_aqui
  ```

5. **Execute o bot:**

```bash
node index.js
```

## Observações
- O banco de dados SQLite já deve estar presente como `painel.sqlite` na raiz do projeto ou na pasta correta.
- Certifique-se de que o bot tem permissões suficientes no servidor Discord.
- Para adicionar mais comandos ou handlers, edite os arquivos na pasta `commands`.

## Dependências principais
- [discord.js](https://discord.js.org/)
- [sqlite3](https://www.npmjs.com/package/sqlite3)

---

Se tiver dúvidas, abra um issue ou entre em contato com o desenvolvedor.
