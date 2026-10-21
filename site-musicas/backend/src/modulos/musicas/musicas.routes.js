// Pessoa 1
const router = require('express').Router();
const c = require('./musicas.controller');
// const upload = require('./musicas.upload'); // TODO: usar no POST

router.get('/', c.listar);
router.get('/:id', c.consultar);
router.post('/', /* upload.single('arquivo'), */ c.importar);
router.delete('/:id', c.excluir);

module.exports = router;
