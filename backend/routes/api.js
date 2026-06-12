// ============================================================
// routes/api.js
// Define todas as rotas da API REST do Universo HQ.
//
// Níveis de acesso:
//   público        → sem login
//   autenticado    → qualquer usuário logado (admin ou usuario)
//   apenasAdmin    → somente role = 'admin'
// ============================================================
const express = require('express');
const router  = express.Router();

const AuthController = require('../controllers/AuthController');
const HqController   = require('../controllers/HqController');

const { autenticado, apenasAdmin }  = require('../middleware/auth');
const { uploadComTratamento }       = require('../config/upload');

// ── AUTENTICAÇÃO ──────────────────────────────────────────────
router.post('/login',   AuthController.login);
router.post('/logout',  autenticado, AuthController.logout);
router.get ('/sessao',  autenticado, AuthController.verificarSessao);

// ── ROTAS PÚBLICAS (sem login) ────────────────────────────────
// Catálogo visível no site — somente HQs Disponíveis
router.get('/public/hqs',    HqController.listarPublico);
router.get('/public/generos', HqController.listarGenerosPublico);

// ── ROTAS PARA QUALQUER USUÁRIO LOGADO ────────────────────────
// Usuário comum acessa para visualizar, admin para gerenciar
router.get('/hqs',            autenticado, HqController.listar);
router.get('/hqs/:id',        autenticado, HqController.buscarUm);
router.get('/estatisticas',   autenticado, HqController.estatisticas);

// ── ROTAS PRIVADAS DE ALTERAÇÃO (somente admin) ───────────────
router.post  ('/hqs',            autenticado, apenasAdmin, uploadComTratamento('imagem'), HqController.adicionar);
router.put   ('/hqs/:id',        autenticado, apenasAdmin, uploadComTratamento('imagem'), HqController.editar);
router.put   ('/hqs/:id/status', autenticado, apenasAdmin, HqController.alterarStatus);
router.delete('/hqs/:id',        autenticado, apenasAdmin, HqController.deletar);

module.exports = router;
