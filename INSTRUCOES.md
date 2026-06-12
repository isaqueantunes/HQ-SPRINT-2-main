# 📚 UNIVERSO HQ — Guia Completo de Instalação e Uso

## Visão Geral

Projeto MVC full-stack para uma loja de quadrinhos e mangás.

```
Frontend (HTML/CSS/JS vanilla)  ←→  Backend (Node.js / Express 5)  ←→  MySQL
```

---

## Estrutura do Projeto

```
universo-hq-mvc/
│
├── banco_de_dados.sql              ← Script SQL: cria BD + tabelas + 6 HQs iniciais
├── INSTRUCOES.md                   ← Este arquivo
│
├── assets/                         ← Cópie aqui a pasta assets do projeto original
│   ├── img/                        ← cat-img.jpg, batman-img..., logo.png, etc.
│   └── fonts/                      ← Moliga DEMO.otf, The Simple Life.otf
│
├── uploads/                        ← Capas enviadas pelo admin (criada automaticamente)
│
├── backend/
│   ├── .env                        ← ⚠️ Credenciais do BD (edite antes de rodar)
│   ├── package.json
│   ├── server.js                   ← Ponto de entrada do servidor Express
│   ├── seed.js                     ← Cria os usuários iniciais (admin + usuario)
│   │
│   ├── config/
│   │   ├── db.js                   ← Pool de conexões MySQL
│   │   └── upload.js               ← Multer: upload de capas de HQ
│   │
│   ├── models/
│   │   ├── Hq.js                   ← Model HQ (CRUD + métodos de instância)
│   │   └── Usuario.js              ← Model Usuário (autenticação com bcrypt)
│   │
│   ├── controllers/
│   │   ├── AuthController.js       ← Login / Logout / Verificar sessão
│   │   └── HqController.js         ← CRUD de HQs + estatísticas
│   │
│   ├── middleware/
│   │   └── auth.js                 ← autenticado() + apenasAdmin()
│   │
│   └── routes/
│       └── api.js                  ← Todas as rotas da API REST
│
└── frontend/
    ├── css/
    │   ├── style.css               ← Vitrine pública (preserva design original)
    │   ├── dashboard.css           ← Painel admin + painel usuário
    │   └── login.css               ← Página de login
    │
    └── views/
        ├── index.html              ← Vitrine pública (catálogo dinâmico)
        ├── login.html              ← Formulário de autenticação
        ├── dashboard.html          ← Painel admin (CRUD completo)
        └── painel-usuario.html     ← Painel usuário (somente visualização)
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|------------|--------------|---------------|
| Node.js    | 18+          | `node -v`     |
| npm        | 9+           | `npm -v`      |
| MySQL      | 8+           | `mysql --version` |

---

## Passo a Passo — Instalação

### 1. Copiar assets do projeto original

Copie a pasta `assets/` do projeto original para dentro de `universo-hq-mvc/`:

```
universo-hq-mvc/assets/img/    ← todas as imagens (cat-img.jpg, logo.png, etc.)
universo-hq-mvc/assets/fonts/  ← Moliga DEMO.otf, The Simple Life.otf
```

### 2. Criar o banco de dados

Abra o MySQL e execute o script:

```bash
mysql -u root -p < banco_de_dados.sql
```

Ou cole o conteúdo do arquivo no MySQL Workbench / DBeaver / phpMyAdmin.

### 3. Configurar as credenciais

Edite o arquivo `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI    ← altere para sua senha do MySQL
DB_NAME=universo_hq_db
SESSION_SECRET=universo_hq_secret_mude_em_producao
```

### 4. Instalar dependências

```bash
cd backend
npm install
```

Pacotes instalados: `express`, `express-session`, `mysql2`, `bcrypt`, `multer`, `cors`, `dotenv`, `nodemon`

### 5. Criar usuários iniciais

```bash
npm run seed
```

Saída esperada:
```
🌱 Criando usuários iniciais...

✅  admin      (admin)
✅  usuario    (usuario)

✅  Seed concluído!
────────────────────────────────────────────
👤  admin   / admin123  → acesso total ao dashboard
👤  usuario / user123   → painel de visualização
```

### 6. Iniciar o servidor

```bash
# Produção
npm start

# Desenvolvimento (reinicia automaticamente com nodemon)
npm run dev
```

### 7. Abrir no navegador

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/` | Vitrine pública |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/dashboard` | Painel admin |
| `http://localhost:3000/painel` | Painel usuário |

---

## Perfis de Acesso

### 🛡️ Admin (`admin` / `admin123`)
- Acessa o **Dashboard Administrativo**
- Visualiza estatísticas (total de HQs, disponíveis, esgotadas)
- **Cadastra** novas HQs (com upload de capa ou URL externa)
- **Edita** qualquer campo de uma HQ
- **Altera o status** (Disponível → Esgotado → Reservado → Disponível)
- **Remove** HQs permanentemente
- Usa o simulador de desconto
- Busca HQs na tabela em tempo real

### 👤 Usuário (`usuario` / `user123`)
- Acessa o **Painel do Usuário** (somente leitura)
- Visualiza o catálogo completo com filtros por status e gênero
- Não tem botões de edição/remoção
- Redirecionado para `/painel` ao fazer login

---

## API REST — Referência

### Autenticação
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/api/login` | Público | Faz login |
| POST | `/api/logout` | Logado | Faz logout |
| GET  | `/api/sessao` | Logado | Dados da sessão atual |

### HQs — Leitura
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/api/public/hqs` | Público | HQs disponíveis (vitrine) |
| GET | `/api/public/generos` | Público | Lista de gêneros |
| GET | `/api/hqs` | Logado | Todas as HQs |
| GET | `/api/hqs/:id` | Logado | Uma HQ por ID |
| GET | `/api/estatisticas` | Logado | Contagens para o dashboard |

### HQs — Escrita (somente admin)
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST   | `/api/hqs` | Admin | Cadastra nova HQ |
| PUT    | `/api/hqs/:id` | Admin | Edita HQ existente |
| PUT    | `/api/hqs/:id/status` | Admin | Alterna status |
| DELETE | `/api/hqs/:id` | Admin | Remove HQ |

---

## Upload de Imagens

- **Formato aceito:** JPG, PNG, WEBP
- **Tamanho máximo:** 5 MB
- **Destino:** pasta `uploads/` na raiz do projeto
- **Alternativa:** informar uma URL externa no campo "URL da Capa"
- Prioridade: arquivo enviado > URL informada > sem imagem

---

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| `ECONNREFUSED` ao iniciar | MySQL não está rodando. Inicie o serviço. |
| `ER_ACCESS_DENIED` | Senha errada no `.env` |
| `ER_BAD_DB_ERROR` | Execute o `banco_de_dados.sql` primeiro |
| Imagens não aparecem | Verifique se copiou a pasta `assets/` corretamente |
| Login não funciona | Execute `npm run seed` para criar os usuários |
| Porta em uso | Mude `PORT` no `.env` para outra porta (ex: 3001) |

---

## Observações de Produção

1. **Troque o `SESSION_SECRET`** no `.env` por uma string longa e aleatória
2. **Remova as dicas de login** do `login.html` (bloco `.dicas-login`)
3. **Use HTTPS** e configure `cookie: { secure: true }` no `server.js`
4. **Nunca suba o `.env`** para repositórios públicos (já está no `.gitignore`)
5. **Configure um `.gitignore`** ignorando: `node_modules/`, `.env`, `uploads/`

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| Servidor | Node.js + Express 5 |
| Banco de Dados | MySQL 8 (via mysql2/promise) |
| Autenticação | express-session + bcrypt |
| Upload | Multer |
| Frontend | HTML5 + CSS3 + JS vanilla |
| UI Framework | Bootstrap 5.3 |
| Fontes | Bangers, Nunito, Moliga, The Simple Life |
| Ícones | Font Awesome 6, Bootstrap Icons |
