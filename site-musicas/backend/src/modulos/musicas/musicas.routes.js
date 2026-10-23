// Rotas das músicas
const router = require('express').Router();
const c = require('./musicas.controller');
const upload = require('./musicas.upload');
const { erro } = require('../../utils/resposta');

const receberArquivo = (req, res, next) => {
  upload.single('arquivo')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return erro(res, 'Arquivo maior que 50 MB.', 413);
    return erro(res, err.message, err.status || 400);
  });
};
 
router.get('/', c.listar);
router.get('/:id', c.consultar);
router.post('/', receberArquivo, c.importar);
router.delete('/:id', c.excluir);
 
module.exports = router;
