// ============================================================
// controllers/AuthController.js
// Gerencia login, logout e verificação de sessão.
// ============================================================
const Usuario = require('../models/Usuario');

class AuthController {

    /**
     * POST /api/login
     * Body: { username, password }
     * Cria sessão e redireciona conforme o perfil:
     *   admin   → /dashboard
     *   usuario → /painel
     */
    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Informe usuário e senha.'
            });
        }

        try {
            const usuario = await Usuario.autenticar(username, password);

            if (usuario) {
                // Guarda os dados essenciais na sessão (sem senha)
                req.session.usuario = {
                    id:       usuario.id,
                    username: usuario.username,
                    role:     usuario.role
                };

                // Destino conforme o perfil
                const redirectTo = usuario.ehAdmin() ? '/dashboard' : '/painel';

                return res.status(200).json({
                    success:    true,
                    user:       req.session.usuario,
                    redirectTo
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos.'
            });

        } catch (erro) {
            console.error('Erro no login:', erro);
            return res.status(500).json({
                success: false,
                message: 'Erro interno no servidor.'
            });
        }
    }

    /**
     * POST /api/logout
     * Destrói a sessão e limpa o cookie.
     */
    static logout(req, res) {
        req.session.destroy((erro) => {
            if (erro) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao encerrar sessão.'
                });
            }
            res.clearCookie('connect.sid');
            return res.json({ success: true, message: 'Logout realizado.' });
        });
    }

    /**
     * GET /api/sessao
     * Retorna os dados do usuário logado (usado pelo frontend para
     * personalizar a UI sem novo login).
     */
    static verificarSessao(req, res) {
        return res.json({
            success: true,
            user:    req.session.usuario
        });
    }
}

module.exports = AuthController;
