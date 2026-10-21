// Pessoa 2
const router = require('express').Router();
const c = require('./playlists.controller');

router.get('/', c.listar);
router.post('/', c.criar);
router.get('/:id', c.consultar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.excluir);
router.post('/:id/musicas', c.adicionarMusica);
router.delete('/:id/musicas/:musicaId', c.removerMusica);
router.put('/:id/ordem', c.reordenar);

module.exports = router;
