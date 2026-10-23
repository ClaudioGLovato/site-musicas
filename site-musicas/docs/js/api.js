// Chamadas ao backend
import { API_URL } from './config.js';

export function mensagemErroHttp(status, mensagemServidor) {
  if (mensagemServidor) return mensagemServidor;

  if (status === 400) return 'Os dados enviados são inválidos. Confira as informações e tente novamente.';
  if (status === 401 || status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'O item solicitado não foi encontrado.';
  if (status === 409) return 'Esta ação não pode ser concluída porque os dados já existem ou estão em conflito.';
  if (status === 413) return 'O arquivo excede o limite de 50 MB.';
  if (status === 415) return 'Formato não aceito. Envie um arquivo MP3, WAV ou OGG.';
  if (status === 429) return 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.';
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em alguns instantes.';
  return `Não foi possível concluir a solicitação (erro ${status}).`;
}

async function pedir(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}/api${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }

  let json;
  try {
    json = await resposta.json();
  } catch {
    throw new Error('O servidor respondeu em um formato inesperado. Tente novamente mais tarde.');
  }

  if (!json || typeof json !== 'object') {
    throw new Error('O servidor respondeu em um formato inesperado. Tente novamente mais tarde.');
  }

  if (!resposta.ok || !json.sucesso) {
    const mensagem = typeof json.erro === 'string' ? json.erro : null;
    throw new Error(mensagemErroHttp(resposta.status, mensagem));
  }

  return json.dados;
}
const corpo = (obj) => JSON.stringify(obj);

// Músicas
export const listarMusicas = () => pedir('/musicas');
export const consultarMusica = (id) => pedir(`/musicas/${id}`);
export const excluirMusica = (id) => pedir(`/musicas/${id}`, { method: 'DELETE' });

// Playlists
export const listarPlaylists = () => pedir('/playlists');
export const consultarPlaylist = (id) => pedir(`/playlists/${id}`);
export const criarPlaylist = (nome, descricao) =>
  pedir('/playlists', { method: 'POST', body: corpo({ nome, descricao }) });
export const renomearPlaylist = (id, nome, descricao) =>
  pedir(`/playlists/${id}`, { method: 'PUT', body: corpo({ nome, descricao }) });
export const excluirPlaylist = (id) => pedir(`/playlists/${id}`, { method: 'DELETE' });
export const adicionarMusica = (id, musicaId) =>
  pedir(`/playlists/${id}/musicas`, { method: 'POST', body: corpo({ musicaId }) });
export const removerMusica = (id, musicaId) =>
  pedir(`/playlists/${id}/musicas/${musicaId}`, { method: 'DELETE' });
export const reordenar = (id, ordem) =>
  pedir(`/playlists/${id}/ordem`, { method: 'PUT', body: corpo({ ordem }) });
