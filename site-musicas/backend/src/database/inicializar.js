// Cria as tabelas do SQlite se ainda não existirem
const db = require('./conexao');

db.exec(`
  CREATE TABLE IF NOT EXISTS musicas (      
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT    NOT NULL,
    formato   TEXT    NOT NULL,
    tamanho   INTEGER NOT NULL,
    caminho   TEXT    NOT NULL,
    criado_em TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS playlists (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    descricao TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS playlist_musicas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    musica_id   INTEGER NOT NULL,
    posicao     INTEGER NOT NULL,
    UNIQUE (playlist_id, musica_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (musica_id)   REFERENCES musicas(id)   ON DELETE CASCADE
  );
`);
