# timestamp

Uma aplicação Node.js que fornece funcionalidades para manipulação e consulta de datas e horários, com suporte a fusos horários personalizados.

## Rotas da API

### `GET /`
- **Descrição:** Página principal (renderiza `index.html`).

---

### `GET /api` ou `GET /api/:date`
- **Descrição:** Retorna data e hora baseada na data passada (ou a atual, se não for fornecida).
- **Parâmetros de URL:**
  - `:date` (opcional) → data a ser convertida (Unix ou UTC)
- **Query params:**
  - `timezone` (opcional) → ex: `+03:00`, `-5`, `2:30`

---

### `GET /api/diff/:date1/:date2`
- **Descrição:** Retorna a diferença entre duas datas
- **Parâmetros de URL:**
  - `:date1` e `:date2` → datas a serem comparadas (Unix ou UTC)

---

### `GET /api/search`

- **Descrição:** Busca zonas de tempo (timezones) com base em **nome**, **fuso horário** ou **código do país**. Se nenhum termo for fornecido, retorna todos os fusos horários distintos do banco de dados, caso contrário, retorna as primeiras 10 correspondências.
- **Query params**
  - `q` (opcional) → ex: `America -3`



## Executando o servidor
1. Na pasta `/api` instale as dependências:
`npm install`

2. Crie os objetos de comunicação com o database:
`npx prisma generate`

3. Inicie o servidor:
`npm start`

A API ficará visível em [http://localhost:3000](http://localhost:3000)
