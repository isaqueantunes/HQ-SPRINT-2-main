-- ============================================================
-- UNIVERSO HQ — Banco de Dados
-- ============================================================
-- Remove e recria o banco para instalação limpa
DROP DATABASE IF EXISTS universo_hq_db;

CREATE DATABASE universo_hq_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universo_hq_db;

-- ============================================================
-- TABELA DE USUÁRIOS
-- roles: 'admin' (acesso total) | 'usuario' (somente leitura)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50)  NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA DE HQs
-- ============================================================
CREATE TABLE IF NOT EXISTS hqs (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    titulo    VARCHAR(150)  NOT NULL,
    editora   VARCHAR(80)   NOT NULL,
    genero    VARCHAR(50)   NOT NULL,
    descricao TEXT          NOT NULL,
    preco     DECIMAL(8,2)  NOT NULL,
    estoque   INT           NOT NULL DEFAULT 0,
    status    ENUM('Disponível','Esgotado','Reservado') DEFAULT 'Disponível',
    imagem    VARCHAR(255)  DEFAULT NULL,  -- arquivo local OU URL externa
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DADOS INICIAIS — 6 HQs com imagens da pasta assets/img
-- ============================================================
INSERT INTO hqs (titulo, editora, genero, descricao, preco, estoque, status, imagem) VALUES
  ('One Piece — Elbaf',       'Panini',       'Manga',        'A saga mais aguardada: Luffy e os chapéus de palha chegam à lendária terra dos gigantes.',                           49.90, 15, 'Disponível', '/assets/img/cat-img.jpg'),
  ('Naruto — Boruto Era',     'Panini',       'Manga',        'A nova geração ninja: Boruto enfrenta ameaças que colocam em xeque o legado de seu pai.',                            39.90, 10, 'Disponível', '/assets/img/cat-img-2.jpg'),
  ('Hulk — Definitivo',       'Marvel Comics','Super-herói',  'A história definitiva de Bruce Banner — entre gênio, monstro e herói improvável.',                                  59.90,  8, 'Disponível', '/assets/img/cat-img-4.jpg'),
  ('Venom — Simbionte Rex',   'Marvel Comics','Super-herói',  'Eddie Brock une forças com o simbionte em uma batalha épica contra a raça klyntar.',                                 54.90,  5, 'Esgotado',   '/assets/img/cat-img-3.jpg'),
  ('Batman — O Cavaleiro',    'DC Comics',    'Super-herói',  'Frank Miller reimagina o cavaleiro das trevas em uma Gotham distópica e sem esperança.',                             64.90, 12, 'Disponível', '/assets/img/cat-img-5.jpg'),
  ('Coringa — Quem Ri Por Último', 'DC Comics','Graphic Novel','Uma descida ao caos: a origem mais perturbadora do vilão mais icônico da DC Comics.',                              69.90,  3, 'Reservado',  '/assets/img/cat-img-6.jpg');
