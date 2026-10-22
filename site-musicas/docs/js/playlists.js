//Pessoa 2
import {
  listarMusicas,
  listarPlaylists,
  consultarPlaylist,
  criarPlaylist,
  excluirPlaylist,
  adicionarMusica,
  removerMusica,
} from './api.js';
import { tocar } from './player.js';

export function iniciarPlaylists() {
  const container = document.getElementById('tela-playlists');
  if (!container) return;

  container.innerHTML = `
    <h2>Gerenciar Playlists</h2>

    <form id="form-criar-playlist" style="margin-bottom: 20px;">
      <input
        type="text"
        id="nome-playlist"
        placeholder="Nome da Playlist"
        required
        style="padding: 8px; margin-right: 5px;"
      >
      <input
        type="text"
        id="desc-playlist"
        placeholder="Descrição (opcional)"
        style="padding: 8px; margin-right: 5px;"
      >
      <button type="submit" style="padding: 8px 12px;">Criar Playlist</button>
    </form>

    <p id="mensagem-playlists" role="status"></p>
    <hr>

    <h3>Suas Playlists</h3>
    <div id="lista-playlists">Carregando playlists...</div>

    <div id="detalhe-playlist" style="margin-top: 20px;"></div>
  `;

  const form = container.querySelector('#form-criar-playlist');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = container.querySelector('#nome-playlist').value.trim();
    const descricao = container.querySelector('#desc-playlist').value.trim();

    try {
      const playlist = await criarPlaylist(nome, descricao);
      form.reset();
      mostrarMensagem('Playlist criada com sucesso.');
      await carregarPlaylists();
      await abrirPlaylist(playlist.id);
    } catch (erro) {
      mostrarMensagem(`Erro ao criar playlist: ${erro.message}`);
    }
  });

  carregarPlaylists();
}

function mostrarMensagem(texto) {
  const area = document.getElementById('mensagem-playlists');
  if (area) area.textContent = texto;
}

function criarBotao(texto, acao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.addEventListener('click', acao);
  return botao;
}

async function carregarPlaylists() {
  const lista = document.getElementById('lista-playlists');
  if (!lista) return;

  lista.textContent = 'Carregando playlists...';

  try {
    const playlists = await listarPlaylists();
    lista.replaceChildren();

    if (playlists.length === 0) {
      lista.textContent = 'Nenhuma playlist encontrada.';
      return;
    }

    playlists.forEach((playlist) => {
      const item = document.createElement('div');
      item.className = 'playlist-item';

      const titulo = document.createElement('h3');
      titulo.textContent = playlist.nome;

      const descricao = document.createElement('p');
      descricao.textContent = playlist.descricao || '';

      const total = document.createElement('span');
      total.textContent = `${playlist.totalMusicas || 0} músicas`;

      const botaoAbrir = criarBotao('Ver / Adicionar Músicas', () => {
        abrirPlaylist(playlist.id);
      });

      const botaoExcluir = criarBotao('Excluir', async () => {
        if (!confirm('Tem certeza que deseja apagar esta playlist?')) return;

        try {
          await excluirPlaylist(playlist.id);
          document.getElementById('detalhe-playlist').replaceChildren();
          mostrarMensagem('Playlist excluída com sucesso.');
          await carregarPlaylists();
        } catch (erro) {
          mostrarMensagem(`Erro ao excluir playlist: ${erro.message}`);
        }
      });

      item.append(titulo, descricao, total, document.createElement('br'), botaoAbrir, botaoExcluir);
      lista.appendChild(item);
    });
  } catch (erro) {
    lista.textContent = 'Não foi possível carregar as playlists.';
    mostrarMensagem(`Erro ao carregar playlists: ${erro.message}`);
  }
}

async function abrirPlaylist(id) {
  const container = document.getElementById('detalhe-playlist');
  if (!container) return;

  try {
    const playlist = await consultarPlaylist(id);
    const musicas = Array.isArray(playlist.musicas) ? playlist.musicas : [];

    container.replaceChildren();

    const painel = document.createElement('div');
    painel.style.cssText = 'border: 2px dashed #007bff; padding: 15px; border-radius: 8px;';

    const titulo = document.createElement('h2');
    titulo.textContent = `Playlist: ${playlist.nome}`;

    const descricao = document.createElement('p');
    descricao.textContent = playlist.descricao || 'Sem descrição';

    const tituloMusicas = document.createElement('h4');
    tituloMusicas.textContent = 'Músicas na playlist:';

    const listaMusicas = document.createElement('ul');

    if (musicas.length === 0) {
      const itemVazio = document.createElement('li');
      itemVazio.textContent = 'Nenhuma música adicionada ainda.';
      listaMusicas.appendChild(itemVazio);
    } else {
      musicas.forEach((musica) => {
        const item = document.createElement('li');
        const nome = document.createElement('strong');
        nome.textContent = musica.nome;

        const formato = document.createTextNode(` (${musica.formato}) `);
        const botaoRemover = criarBotao('Remover', async () => {
          try {
            await removerMusica(playlist.id, musica.id);
            mostrarMensagem('Música removida da playlist.');
            await abrirPlaylist(playlist.id);
            await carregarPlaylists();
          } catch (erro) {
            mostrarMensagem(`Erro ao remover música: ${erro.message}`);
          }
        });

        item.append(nome, formato, botaoRemover);
        listaMusicas.appendChild(item);
      });
    }

    const botaoTocar = criarBotao('▶ Tocar Playlist', () => {
      if (musicas.length === 0) {
        mostrarMensagem('A playlist está vazia.');
        return;
      }

      tocar(musicas, 0);
    });
    botaoTocar.disabled = musicas.length === 0;

    const areaAdicionar = document.createElement('div');
    const tituloAdicionar = document.createElement('h4');
    tituloAdicionar.textContent = 'Adicionar música';

    const seletor = document.createElement('select');
    seletor.setAttribute('aria-label', 'Escolha uma música para adicionar');

    const botaoAdicionar = criarBotao('Adicionar', async () => {
      const musicaId = Number(seletor.value);
      if (!musicaId) return;

      try {
        await adicionarMusica(playlist.id, musicaId);
        mostrarMensagem('Música adicionada à playlist.');
        await abrirPlaylist(playlist.id);
        await carregarPlaylists();
      } catch (erro) {
        mostrarMensagem(`Erro ao adicionar música: ${erro.message}`);
      }
    });

    const biblioteca = await listarMusicas();
    const idsNaPlaylist = new Set(musicas.map((musica) => musica.id));
    const disponiveis = biblioteca.filter((musica) => !idsNaPlaylist.has(musica.id));

    if (disponiveis.length === 0) {
      const aviso = document.createElement('p');
      aviso.textContent = biblioteca.length === 0
        ? 'Cadastre músicas antes de adicioná-las a uma playlist.'
        : 'Todas as músicas da biblioteca já estão nesta playlist.';
      areaAdicionar.append(tituloAdicionar, aviso);
    } else {
      disponiveis.forEach((musica) => {
        const opcao = document.createElement('option');
        opcao.value = musica.id;
        opcao.textContent = musica.nome;
        seletor.appendChild(opcao);
      });

      areaAdicionar.append(tituloAdicionar, seletor, botaoAdicionar);
    }

    painel.append(
      titulo,
      descricao,
      tituloMusicas,
      listaMusicas,
      botaoTocar,
      areaAdicionar
    );

    container.appendChild(painel);
  } catch (erro) {
    mostrarMensagem(`Erro ao abrir playlist: ${erro.message}`);
  }
}
