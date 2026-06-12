// ============================================================
// server.js — Ponto de entrada do servidor Express
// ============================================================
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ───────────────────────────────────────
app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão com cookie httpOnly (8 horas de validade)
app.use(session({
    secret:            process.env.SESSION_SECRET || 'universo_hq_secret',
    resave:            false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));

// ── Arquivos estáticos ────────────────────────────────────────
// Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Assets do projeto original (imagens, fontes)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Uploads de capas enviadas pelo admin
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rotas da API ──────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Rotas HTML ────────────────────────────────────────────────
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/index.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/dashboard.html')));
app.get('/painel',    (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/painel-usuario.html')));

// ── Handler global de erros ───────────────────────────────────
// OBRIGATÓRIO no Express 5: garante que qualquer erro retorne JSON
// em vez do HTML padrão do framework (que quebra o fetch().json()).
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno no servidor.' });
});

// ── Inicialização ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor:  http://localhost:${PORT}`);
    console.log(`🌐 Vitrine:   http://localhost:${PORT}/`);
    console.log(`🔐 Login:     http://localhost:${PORT}/login`);
    console.log(`📋 Admin:     http://localhost:${PORT}/dashboard`);
    console.log(`👤 Usuário:   http://localhost:${PORT}/painel\n`);
});
