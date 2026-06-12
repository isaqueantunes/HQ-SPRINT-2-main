// ============================================================
// models/Hq.js
// Representa uma HQ do acervo.
// Responsável por TODA a comunicação com a tabela `hqs`.
// ============================================================
const db = require('../config/db');

class Hq {

    /**
     * @param {number} id
     * @param {string} titulo
     * @param {string} editora
     * @param {string} genero
     * @param {string} descricao
     * @param {number} preco
     * @param {number} estoque
     * @param {string} status   'Disponível' | 'Esgotado' | 'Reservado'
     * @param {string|null} imagem  caminho local ou URL externa
     * @param {Date}   criado_em
     */
    constructor(id, titulo, editora, genero, descricao, preco, estoque, status, imagem, criado_em) {
        this.id        = id;
        this.titulo    = titulo;
        this.editora   = editora;
        this.genero    = genero;
        this.descricao = descricao;
        this.preco     = preco;
        this.estoque   = estoque;
        this.status    = status;
        this.imagem    = imagem;
        this.criado_em = criado_em;
    }

    // ── Métodos de instância ────────────────────────────────

    /** Retorna true quando a HQ está disponível para compra */
    estaDisponivel() {
        return this.status === 'Disponível';
    }

    /** Resumo legível para logs */
    exibirResumo() {
        return `[${this.editora}] ${this.titulo} — R$ ${this.preco} — ${this.status} (${this.estoque} un.)`;
    }

    /** Preço formatado no padrão brasileiro */
    precoFormatado() {
        return `R$ ${parseFloat(this.preco).toFixed(2).replace('.', ',')}`;
    }

    // ── Métodos estáticos (acesso ao BD) ───────────────────

    /**
     * Lista todas as HQs, da mais recente para a mais antiga.
     * Usado pelo admin no dashboard.
     */
    static async listarTodos() {
        const [rows] = await db.execute('SELECT * FROM hqs ORDER BY id DESC');
        return rows;
    }

    /**
     * Lista apenas HQs disponíveis, agrupadas por gênero e título.
     * Usado pelo catálogo público no index.html.
     */
    static async listarDisponiveis() {
        const [rows] = await db.execute(
            "SELECT * FROM hqs WHERE status = 'Disponível' ORDER BY genero, titulo"
        );
        return rows;
    }

    /**
     * Busca uma HQ pelo ID e retorna uma instância da classe,
     * ou null se não encontrado.
     */
    static async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM hqs WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const d = rows[0];
        return new Hq(d.id, d.titulo, d.editora, d.genero, d.descricao,
                      d.preco, d.estoque, d.status, d.imagem, d.criado_em);
    }

    /**
     * Conta o total de HQs no acervo — usado pelo card de estatísticas.
     */
    static async contarTotal() {
        const [rows] = await db.execute('SELECT COUNT(*) AS total FROM hqs');
        return rows[0].total;
    }

    /**
     * Conta as HQs disponíveis — usado pelas estatísticas do admin.
     */
    static async contarDisponiveis() {
        const [rows] = await db.execute(
            "SELECT COUNT(*) AS total FROM hqs WHERE status = 'Disponível'"
        );
        return rows[0].total;
    }

    /**
     * Insere uma nova HQ.
     * @returns {number} ID gerado pelo banco
     */
    static async adicionar(titulo, editora, genero, descricao, preco, estoque, status, imagem) {
        const [resultado] = await db.execute(
            `INSERT INTO hqs (titulo, editora, genero, descricao, preco, estoque, status, imagem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [titulo, editora, genero, descricao, preco, estoque, status, imagem || null]
        );
        return resultado.insertId;
    }

    /**
     * Atualiza uma HQ existente.
     * Se `imagem` for null/undefined, mantém a imagem atual no banco.
     */
    static async editar(id, titulo, editora, genero, descricao, preco, estoque, status, imagem) {
        if (imagem) {
            await db.execute(
                `UPDATE hqs SET titulo=?, editora=?, genero=?, descricao=?,
                 preco=?, estoque=?, status=?, imagem=? WHERE id=?`,
                [titulo, editora, genero, descricao, preco, estoque, status, imagem, id]
            );
        } else {
            await db.execute(
                `UPDATE hqs SET titulo=?, editora=?, genero=?, descricao=?,
                 preco=?, estoque=?, status=? WHERE id=?`,
                [titulo, editora, genero, descricao, preco, estoque, status, id]
            );
        }
    }

    /**
     * Altera apenas o status de uma HQ.
     * Ciclo: Disponível → Esgotado → Reservado → Disponível
     */
    static async alterarStatus(id, novoStatus) {
        await db.execute('UPDATE hqs SET status=? WHERE id=?', [novoStatus, id]);
    }

    /** Remove permanentemente uma HQ do banco. */
    static async deletar(id) {
        await db.execute('DELETE FROM hqs WHERE id=?', [id]);
    }

    /**
     * Retorna a lista de gêneros distintos presentes no acervo.
     * Usado para popular os filtros do catálogo dinamicamente.
     */
    static async listarGeneros() {
        const [rows] = await db.execute('SELECT DISTINCT genero FROM hqs ORDER BY genero');
        return rows.map(r => r.genero);
    }

    /**
     * Retorna a lista de editoras distintas — usada no select do formulário.
     */
    static async listarEditoras() {
        const [rows] = await db.execute('SELECT DISTINCT editora FROM hqs ORDER BY editora');
        return rows.map(r => r.editora);
    }
}

module.exports = Hq;
