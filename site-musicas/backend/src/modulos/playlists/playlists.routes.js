// Rotas da playlist
const { Router } = require('express');
const c = require('./playlists.controller');

const router = Router();

router.post('/', c.criar);
router.get('/', c.listar);
router.get('/:id', c.obter);
router.put('/:id', c.atualizar);
router.delete('/:id', c.excluir);

router.post('/:id/musicas', c.adicionarMusica);
router.delete('/:id/musicas/:musicaId', c.removerMusica);
router.put('/:id/ordem', c.reordenar);

module.exports = router;
