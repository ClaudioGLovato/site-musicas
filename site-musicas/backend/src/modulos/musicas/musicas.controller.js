// Pessoa 1: regras das rotas de músicas
// Lembre: no JSON os campos saem em camelCase (criadoEm) e o campo `url` = "/uploads/arquivo.mp3".
// Nunca devolver o `caminho` do arquivo.
const db = require('../../database/conexao');
const { ok, erro } = require('../../utils/resposta');

const naoFeito = (res) => erro(res, 'Ainda não implementado (Pessoa 1 do backend).', 501);

exports.listar = (req, res) => ok(res, []); // TODO: SELECT no banco
exports.consultar = (req, res) => naoFeito(res);
exports.importar = (req, res) => naoFeito(res);  // TODO: gravar no banco, responder 201
exports.excluir = (req, res) => naoFeito(res);   // TODO: apagar o registro e o arquivo (fs.unlink)
