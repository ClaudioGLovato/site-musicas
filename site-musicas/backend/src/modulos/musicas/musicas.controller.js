// Pessoa 1: regras das rotas de músicas
const fs = require('fs');
const path = require('path');
const db = require('../../database/conexao');
const { ok, erro } = require('../../utils/resposta');

// Tabela: musicas (id, nome, formato, tamanho, caminho, criado_em)
const COLUNAS = 'id, nome, formato, tamanho, caminho, criado_em';

const paraJson = (m) => ({
  id: m.id,
  nome: m.nome,
  formato: m.formato,
  tamanho: m.tamanho,
  url: `/uploads/${path.basename(m.caminho)}`,
  criadoEm: m.criado_em,
});

const apagarArquivo = (caminho) => fs.unlink(caminho, () => {});

exports.listar = (req, res) => {
  const linhas = db.prepare(`SELECT ${COLUNAS} FROM musicas ORDER BY id DESC`).all();
  ok(res, linhas.map(paraJson));
};

exports.consultar = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
  return erro(res, 'Id inválido.', 400);
}
  const m = db.prepare(`SELECT ${COLUNAS} FROM musicas WHERE id = ?`).get(id);
  if (!m) return erro(res, 'Música não encontrada.', 404);
  ok(res, paraJson(m));
};

exports.importar = (req, res) => {
  if (!req.file) return erro(res, 'Envie um arquivo no campo "arquivo".', 400);

  try {
    const nomeOriginal = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const nome = (req.body.nome || req.body.titulo || '').trim() || path.parse(nomeOriginal).name;
    const formato = path.extname(req.file.filename).slice(1).toLowerCase();

    const info = db
      .prepare('INSERT INTO musicas (nome, formato, tamanho, caminho) VALUES (?, ?, ?, ?)')
      .run(nome, formato, req.file.size, req.file.path);

    const m = db.prepare(`SELECT ${COLUNAS} FROM musicas WHERE id = ?`).get(info.lastInsertRowid);
    ok(res, paraJson(m),'Música importada com sucesso.', 201);
  } catch (e) {
    apagarArquivo(req.file.path);
    console.error(e);
    erro(res, 'Erro ao salvar a música.', 500);
  }
};

exports.excluir = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
  return erro(res, 'Id inválido.', 400);
}
  const m = db.prepare('SELECT id, caminho FROM musicas WHERE id = ?').get(id);
  if (!m) return erro(res, 'Música não encontrada.', 404);

  db.prepare('DELETE FROM playlist_musicas WHERE musica_id = ?').run(id);
  db.prepare('DELETE FROM musicas WHERE id = ?').run(id);
  apagarArquivo(m.caminho);
  ok(res, { id });
};