// ============================================================
// models/Usuario.js
// Representa um usuário do sistema.
// Lida com autenticação via bcrypt.
// ============================================================
const db     = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {

    /**
     * @param {number} id
     * @param {string} username
     * @param {string} role  'admin' | 'usuario'
     */
    constructor(id, username, role) {
        this.id       = id;
        this.username = username;
        this.role     = role;
    }

    /** Retorna true se o usuário é administrador */
    ehAdmin() {
        return this.role === 'admin';
    }

    /** Representação legível para logs */
    exibirInfo() {
        return `Usuário: ${this.username} | Perfil: ${this.role}`;
    }

    // ── Métodos estáticos ───────────────────────────────────

    /**
     * Autentica username + senha.
     * Retorna instância de Usuario ou null se inválido.
     */
    static async autenticar(username, senhaDigitada) {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE username = ?',
            [username]
        );
        if (rows.length === 0) return null;

        const u  = rows[0];
        const ok = await bcrypt.compare(senhaDigitada, u.password);
        return ok ? new Usuario(u.id, u.username, u.role) : null;
    }

    /**
     * Lista todos os usuários (apenas para o admin visualizar).
     * Nunca retorna o campo `password`.
     */
    static async listarTodos() {
        const [rows] = await db.execute(
            'SELECT id, username, role, criado_em FROM usuarios ORDER BY id'
        );
        return rows;
    }

    /**
     * Cria um novo usuário com senha criptografada.
     * @returns {number} ID gerado pelo banco
     */
    static async criar(username, senha, role = 'usuario') {
        const hash = await bcrypt.hash(senha, 10);
        const [resultado] = await db.execute(
            'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)',
            [username, hash, role]
        );
        return resultado.insertId;
    }

    /**
     * Atualiza senha de um usuário.
     */
    static async atualizarSenha(id, novaSenha) {
        const hash = await bcrypt.hash(novaSenha, 10);
        await db.execute('UPDATE usuarios SET password=? WHERE id=?', [hash, id]);
    }

    /** Remove um usuário pelo ID. */
    static async deletar(id) {
        await db.execute('DELETE FROM usuarios WHERE id=?', [id]);
    }
}

module.exports = Usuario;
