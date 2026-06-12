// ============================================================
// controllers/HqController.js
// Gerencia todas as requisições relacionadas às HQs:
//   - listagem pública (catálogo)
//   - CRUD completo (somente admin)
//   - alternância de status
//   - estatísticas do painel
// ============================================================
const Hq = require('../models/Hq');

class HqController {

    // ── PÚBLICO ────────────────────────────────────────────

    /**
     * GET /api/public/hqs
     * Retorna apenas HQs DISPONÍVEIS — sem autenticação.
     * Usada pelo catálogo do index.html.
     */
    static async listarPublico(req, res) {
        try {
            const hqs = await Hq.listarDisponiveis();
            return res.json(hqs);
        } catch (erro) {
            console.error('Erro ao listar HQs públicas:', erro);
            return res.status(500).json({ erro: 'Erro ao carregar catálogo.' });
        }
    }

    /**
     * GET /api/public/generos
     * Retorna lista de gêneros distintos — para filtros dinâmicos.
     */
    static async listarGenerosPublico(req, res) {
        try {
            const generos = await Hq.listarGeneros();
            return res.json(generos);
        } catch (erro) {
            return res.status(500).json({ erro: 'Erro ao listar gêneros.' });
        }
    }

    // ── PRIVADO (usuário logado) ───────────────────────────

    /**
     * GET /api/hqs
     * Retorna TODAS as HQs — admin e usuário logado acessam.
     */
    static async listar(req, res) {
        try {
            const hqs = await Hq.listarTodos();
            return res.json(hqs);
        } catch (erro) {
            console.error('Erro ao listar HQs:', erro);
            return res.status(500).json({ erro: 'Erro ao listar HQs.' });
        }
    }

    /**
     * GET /api/hqs/:id
     * Retorna uma HQ pelo ID — usado para preencher o modal de edição.
     */
    static async buscarUm(req, res) {
        try {
            const hq = await Hq.buscarPorId(req.params.id);
            if (!hq) {
                return res.status(404).json({ erro: 'HQ não encontrada.' });
            }
            console.log('HQ buscada:', hq.exibirResumo());
            return res.json(hq);
        } catch (erro) {
            console.error('Erro ao buscar HQ:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar HQ.' });
        }
    }

    /**
     * GET /api/estatisticas
     * Retorna contagens para os cards de estatísticas do dashboard.
     */
    static async estatisticas(req, res) {
        try {
            const [total, disponiveis] = await Promise.all([
                Hq.contarTotal(),
                Hq.contarDisponiveis()
            ]);
            return res.json({
                totalHqs:    total,
                disponiveis: disponiveis,
                esgotadas:   total - disponiveis
            });
        } catch (erro) {
            console.error('Erro ao buscar estatísticas:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
        }
    }

    // ── PRIVADO ADMIN ONLY ─────────────────────────────────

    /**
     * POST /api/hqs
     * Cadastra nova HQ.
     * Aceita upload de capa (multipart) OU URL externa via campo `imagemUrl`.
     */
    static async adicionar(req, res) {
        const { titulo, editora, genero, descricao, preco, estoque, status, imagemUrl } = req.body;

        // Rejeitar arquivo com formato inválido detectado no middleware
        if (req.fileValidationError) {
            return res.status(400).json({ erro: req.fileValidationError });
        }

        // Prioridade: arquivo enviado > URL > null
        let imagem = req.file
            ? `/uploads/${req.file.filename}`
            : (imagemUrl || null);

        if (!titulo || !editora || !genero || !descricao || !preco || !status) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        }
        if (Number(preco) < 0) {
            return res.status(400).json({ erro: 'O preço não pode ser negativo.' });
        }
        if (Number(estoque) < 0) {
            return res.status(400).json({ erro: 'O estoque não pode ser negativo.' });
        }

        try {
            const novoId = await Hq.adicionar(titulo, editora, genero, descricao, preco, estoque || 0, status, imagem);
            return res.status(201).json({ mensagem: 'HQ cadastrada com sucesso!', id: novoId });
        } catch (erro) {
            console.error('Erro ao adicionar HQ:', erro);
            return res.status(500).json({ erro: 'Erro ao cadastrar HQ.' });
        }
    }

    /**
     * PUT /api/hqs/:id
     * Edita HQ existente. Nova imagem é opcional.
     */
    static async editar(req, res) {
        const id = req.params.id;
        const { titulo, editora, genero, descricao, preco, estoque, status, imagemUrl } = req.body;

        if (req.fileValidationError) {
            return res.status(400).json({ erro: req.fileValidationError });
        }

        let imagem = req.file
            ? `/uploads/${req.file.filename}`
            : (imagemUrl || null);

        if (!titulo || !editora || !genero || !descricao || !preco || !status) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        }

        try {
            await Hq.editar(id, titulo, editora, genero, descricao, preco, estoque || 0, status, imagem);
            return res.json({ mensagem: 'HQ atualizada com sucesso!' });
        } catch (erro) {
            console.error('Erro ao editar HQ:', erro);
            return res.status(500).json({ erro: 'Erro ao atualizar HQ.' });
        }
    }

    /**
     * PUT /api/hqs/:id/status
     * Cicla o status da HQ: Disponível → Esgotado → Reservado → Disponível.
     */
    static async alterarStatus(req, res) {
        try {
            const hq = await Hq.buscarPorId(req.params.id);
            if (!hq) {
                return res.status(404).json({ erro: 'HQ não encontrada.' });
            }

            // Ciclo de status
            const ciclo = { 'Disponível': 'Esgotado', 'Esgotado': 'Reservado', 'Reservado': 'Disponível' };
            const novoStatus = ciclo[hq.status] || 'Disponível';

            await Hq.alterarStatus(req.params.id, novoStatus);
            return res.json({ mensagem: `HQ marcada como ${novoStatus}!`, status: novoStatus });
        } catch (erro) {
            console.error('Erro ao alterar status:', erro);
            return res.status(500).json({ erro: 'Erro ao alterar status.' });
        }
    }

    /**
     * DELETE /api/hqs/:id
     * Remove permanentemente uma HQ.
     */
    static async deletar(req, res) {
        try {
            const hq = await Hq.buscarPorId(req.params.id);
            if (!hq) {
                return res.status(404).json({ erro: 'HQ não encontrada.' });
            }
            await Hq.deletar(req.params.id);
            return res.json({ mensagem: 'HQ removida com sucesso.' });
        } catch (erro) {
            console.error('Erro ao deletar HQ:', erro);
            return res.status(500).json({ erro: 'Erro ao remover HQ.' });
        }
    }
}

module.exports = HqController;
