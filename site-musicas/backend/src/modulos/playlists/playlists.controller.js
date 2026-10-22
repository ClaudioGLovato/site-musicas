// Pessoa 2: regras das rotas de playlists
const path = require('path');
const db = require('../../database/conexao');
const { ok, erro } = require('../../utils/resposta');

function parseId(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function textoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  const t = String(valor).trim();
  return t === '' ? null : t;
}

function buscarPlaylist(id) {
  return db
    .prepare('SELECT id, nome, descricao, criado_em FROM playlists WHERE id = ?')
    .get(id);
}

function musicaExiste(id) {
  return !!db.prepare('SELECT 1 FROM musicas WHERE id = ?').get(id);
}

function montarPlaylistCompleta(id) {
  const p = buscarPlaylist(id);
  if (!p) return null;

  const linhas = db
    .prepare(
      `SELECT m.id, m.nome, m.formato, m.tamanho, m.caminho, pm.posicao
         FROM playlist_musicas pm
         JOIN musicas m ON m.id = pm.musica_id
        WHERE pm.playlist_id = ?
        ORDER BY pm.posicao ASC`
    )
    .all(id);

  const musicas = linhas.map((m) => ({
    id: m.id,
    nome: m.nome,
    formato: m.formato,
    tamanho: m.tamanho,
    url: `/uploads/${path.basename(m.caminho)}`,
    posicao: m.posicao,
  }));

  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    totalMusicas: musicas.length,
    criadoEm: p.criado_em,
    musicas,
  };
}

function reajustarPosicoes(playlistId) {
  const itens = db
    .prepare('SELECT id FROM playlist_musicas WHERE playlist_id = ? ORDER BY posicao ASC, id ASC')
    .all(playlistId);
  const atualizar = db.prepare('UPDATE playlist_musicas SET posicao = ? WHERE id = ?');
  itens.forEach((item, i) => atualizar.run(i + 1, item.id));
}

function criar(req, res) {
  const { nome, descricao } = req.body || {};
  const nomeLimpo = textoOuNulo(nome);
  if (!nomeLimpo) return erro(res, 'O nome da playlist é obrigatório.', 400);

  const info = db
    .prepare('INSERT INTO playlists (nome, descricao) VALUES (?, ?)')
    .run(nomeLimpo, textoOuNulo(descricao));

  return ok(res, montarPlaylistCompleta(info.lastInsertRowid), 'Playlist criada com sucesso', 201);
}

function listar(req, res) {
  const linhas = db
    .prepare(
      `SELECT p.id, p.nome, p.descricao, p.criado_em, COUNT(pm.id) AS total_musicas
         FROM playlists p
         LEFT JOIN playlist_musicas pm ON pm.playlist_id = p.id
        GROUP BY p.id
        ORDER BY p.criado_em DESC, p.id DESC`
    )
    .all();

  const dados = linhas.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    totalMusicas: p.total_musicas,
    criadoEm: p.criado_em,
  }));

  return ok(res, dados);
}

function obter(req, res) {
  const id = parseId(req.params.id);
  if (!id) return erro(res, 'O id da playlist deve ser um número válido.', 400);

  const playlist = montarPlaylistCompleta(id);
  if (!playlist) return erro(res, 'Playlist não encontrada.', 404);

  return ok(res, playlist);
}

function atualizar(req, res) {
  const id = parseId(req.params.id);
  if (!id) return erro(res, 'O id da playlist deve ser um número válido.', 400);

  const atual = buscarPlaylist(id);
  if (!atual) return erro(res, 'Playlist não encontrada.', 404);

  const { nome, descricao } = req.body || {};
  const nomeLimpo = textoOuNulo(nome);
  if (!nomeLimpo) return erro(res, 'O nome da playlist é obrigatório.', 400);

  const novaDescricao = descricao === undefined ? atual.descricao : textoOuNulo(descricao);

  db.prepare('UPDATE playlists SET nome = ?, descricao = ? WHERE id = ?').run(
    nomeLimpo,
    novaDescricao,
    id
  );

  return ok(res, montarPlaylistCompleta(id), 'Playlist atualizada com sucesso');
}

function excluir(req, res) {
  const id = parseId(req.params.id);
  if (!id) return erro(res, 'O id da playlist deve ser um número válido.', 400);

  const info = db.prepare('DELETE FROM playlists WHERE id = ?').run(id);
  if (info.changes === 0) return erro(res, 'Playlist não encontrada.', 404);

  return ok(res, { id }, 'Playlist excluída com sucesso');
}

function adicionarMusica(req, res) {
  const id = parseId(req.params.id);
  if (!id) return erro(res, 'O id da playlist deve ser um número válido.', 400);

  const musicaId = parseId((req.body || {}).musicaId);
  if (!musicaId) return erro(res, 'O id da música deve ser um número válido.', 400);

  if (!buscarPlaylist(id)) return erro(res, 'Playlist não encontrada.', 404);
  if (!musicaExiste(musicaId)) return erro(res, 'Música não encontrada.', 404);

  const jaExiste = db
    .prepare('SELECT 1 FROM playlist_musicas WHERE playlist_id = ? AND musica_id = ?')
    .get(id, musicaId);
  if (jaExiste) return erro(res, 'Esta música já está na playlist.', 409);

  const inserir = db.transaction(() => {
    const { maxPos } = db
      .prepare('SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM playlist_musicas WHERE playlist_id = ?')
      .get(id);
    db.prepare(
      'INSERT INTO playlist_musicas (playlist_id, musica_id, posicao) VALUES (?, ?, ?)'
    ).run(id, musicaId, maxPos + 1);
  });
  inserir();

  return ok(res, montarPlaylistCompleta(id), 'Música adicionada à playlist', 201);
}

function removerMusica(req, res) {
  const id = parseId(req.params.id);
  const musicaId = parseId(req.params.musicaId);
  if (!id || !musicaId) return erro(res, 'Os ids devem ser números válidos.', 400);

  if (!buscarPlaylist(id)) return erro(res, 'Playlist não encontrada.', 404);

  const remover = db.transaction(() => {
    const info = db
      .prepare('DELETE FROM playlist_musicas WHERE playlist_id = ? AND musica_id = ?')
      .run(id, musicaId);
    if (info.changes === 0) return false;
    reajustarPosicoes(id);
    return true;
  });

  if (!remover()) return erro(res, 'Esta música não está na playlist.', 404);

  return ok(res, montarPlaylistCompleta(id), 'Música removida da playlist');
}

function reordenar(req, res) {
  const id = parseId(req.params.id);
  if (!id) return erro(res, 'O id da playlist deve ser um número válido.', 400);

  if (!buscarPlaylist(id)) return erro(res, 'Playlist não encontrada.', 404);

  const { ordem } = req.body || {};
  if (!Array.isArray(ordem) || !ordem.every((v) => Number.isInteger(v) && v > 0)) {
    return erro(res, 'A ordem deve ser uma lista de ids de músicas.', 400);
  }

  const atuais = db
    .prepare('SELECT musica_id FROM playlist_musicas WHERE playlist_id = ?')
    .all(id)
    .map((l) => l.musica_id);

  const novos = new Set(ordem);
  const bate =
    novos.size === ordem.length &&
    ordem.length === atuais.length &&
    atuais.every((m) => novos.has(m));

  if (!bate) {
    return erro(res, 'A ordem deve conter exatamente as músicas da playlist, sem repetir.', 400);
  }

  const salvar = db.transaction(() => {
    const atualizar = db.prepare(
      'UPDATE playlist_musicas SET posicao = ? WHERE playlist_id = ? AND musica_id = ?'
    );
    ordem.forEach((musicaId, i) => atualizar.run(i + 1, id, musicaId));
  });
  salvar();

  return ok(res, montarPlaylistCompleta(id), 'Ordem salva com sucesso');
}

module.exports = {
  criar,
  listar,
  obter,
  atualizar,
  excluir,
  adicionarMusica,
  removerMusica,
  reordenar,
};
