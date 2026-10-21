// Pessoa 3: todas as chamadas ao backend ficam aqui.
// Cada função devolve `dados` ou lança um erro com a mensagem do backend.
import { API_URL } from './config.js';

async function pedir(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}/api${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });
  const json = await resposta.json();
  if (!json.sucesso) throw new Error(json.erro);
  return json.dados;
}
const corpo = (obj) => JSON.stringify(obj);

// Músicas (o upload usa XMLHttpRequest e fica em musicas.js, Pessoa 1)
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
