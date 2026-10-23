//Erros e mensagens para o frontend
const { erro } = require('../utils/resposta');

const rotaNaoEncontrada = (req, res) => erro(res, 'Rota não encontrada', 404);

const tratadorDeErros = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return erro(res, 'Arquivo maior que 50 MB.', 413);
  if (err.status) return erro(res, err.message, err.status);
  console.error(err);
  return erro(res, 'Erro interno do servidor', 500);
};

module.exports = { rotaNaoEncontrada, tratadorDeErros };
