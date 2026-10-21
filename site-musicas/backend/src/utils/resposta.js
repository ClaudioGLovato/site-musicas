// Pessoa 3: padrão das respostas JSON
const ok = (res, dados, mensagem, status = 200) =>
  res.status(status).json({ sucesso: true, dados, ...(mensagem && { mensagem }) });

const erro = (res, mensagem, status = 400) =>
  res.status(status).json({ sucesso: false, erro: mensagem });

module.exports = { ok, erro };
