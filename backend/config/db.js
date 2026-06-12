// ============================================================
// config/db.js
// Pool de conexões com o MySQL via mysql2/promise.
// Lê as credenciais do arquivo .env (nunca coloque senhas
// diretamente no código-fonte).
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:               process.env.DB_HOST,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASSWORD,
    database:           process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:    10,   // máximo de conexões simultâneas
    queueLimit:         0     // fila sem limite
});

module.exports = pool;
