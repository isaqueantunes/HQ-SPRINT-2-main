// ============================================================
// middleware/auth.js
// Guardas de rota que verificam autenticação e permissão.
// ============================================================

/**
 * autenticado — garante que o usuário fez login.
 * Retorna 401 se não houver sessão ativa.
 */
function autenticado(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).json({ erro: 'Acesso negado. Faça login primeiro.' });
}

/**
 * apenasAdmin — garante que o usuário logado tem perfil 'admin'.
 * Retorna 403 se o usuário for 'usuario' comum.
 * Sempre deve ser usado APÓS `autenticado`.
 */
function apenasAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.role === 'admin') {
        return next();
    }
    return res.status(403).json({ erro: 'Acesso proibido. Apenas administradores.' });
}

module.exports = { autenticado, apenasAdmin };
