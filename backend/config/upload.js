// ============================================================
// config/upload.js
// Configuração do Multer para upload de capas de HQ.
// Aceita JPG, PNG, WEBP até 5 MB.
// Arquivos salvos em /uploads com nome único para evitar
// colisões entre uploads simultâneos.
// ============================================================
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Onde salvar e como nomear cada arquivo enviado
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads');
        // Cria a pasta se ainda não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext    = path.extname(file.originalname);
        // timestamp + número aleatório → nome único
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, unique);
    }
});

// Rejeita arquivos que não sejam imagens suportadas
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Não lança erro — o controller verifica req.fileValidationError
        req.fileValidationError = 'Formato inválido. Envie apenas JPG, PNG ou WEBP.';
        cb(null, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB máximo
});

// ── Wrapper que converte erros do Multer em respostas JSON limpas ──
// Necessário no Express 5: sem isso, erros de tamanho retornam HTML.
function uploadComTratamento(campo) {
    return function (req, res, next) {
        upload.single(campo)(req, res, function (err) {
            if (err) {
                const msg = err.code === 'LIMIT_FILE_SIZE'
                    ? 'Arquivo muito grande. Máximo permitido: 5 MB.'
                    : err.message || 'Erro no upload do arquivo.';
                return res.status(400).json({ erro: msg });
            }
            next();
        });
    };
}

module.exports = { uploadComTratamento };
