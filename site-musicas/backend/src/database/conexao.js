// Pessoa 3: abre o SQLite
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', '..', 'banco.sqlite'));
db.pragma('foreign_keys = ON'); // sem isso o ON DELETE CASCADE não funciona

module.exports = db;
