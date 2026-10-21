// Pessoa 2: regras das rotas de playlists
// As rotas que mudam a playlist (adicionar, remover, reordenar) devolvem a playlist completa.
// Erros: 400 dados inválidos, 404 não existe, 409 música já está na playlist.
const db = require('../../database/conexao');
const { ok, erro } = require('../../utils/resposta');

const naoFeito = (res) => erro(res, 'Ainda não implementado (Pessoa 2 do backend).', 501);

exports.listar = (req, res) => ok(res, []); // TODO: incluir totalMusicas
exports.criar = (req, res) => naoFeito(res);
exports.consultar = (req, res) => naoFeito(res);
exports.atualizar = (req, res) => naoFeito(res);
exports.excluir = (req, res) => naoFeito(res);
exports.adicionarMusica = (req, res) => naoFeito(res);
exports.removerMusica = (req, res) => naoFeito(res);
exports.reordenar = (req, res) => naoFeito(res);
