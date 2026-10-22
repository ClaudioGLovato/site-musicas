import {
  listarMusicas,
  listarPlaylists,
  consultarPlaylist,
  criarPlaylist,
  renomearPlaylist,
  excluirPlaylist,
  adicionarMusica,
  removerMusica,
  reordenar,
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
      mostrarMensagem('Playlist criada com sucesso.', 'sucesso');
      await carregarPlaylists();
      await abrirPlaylist(playlist.id);
    } catch (erro) {
      mostrarMensagem(`Erro ao criar playlist: ${erro.message}`);
    }
  });

  carregarPlaylists();
}

function mostrarMensagem(texto, tipo = 'erro') {
  const area = document.getElementById('mensagem-playlists');
  if (!area) return;

  area.textContent = texto;
  area.className = `mensagem-playlists mensagem-playlists-${tipo}`;
  area.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  area.setAttribute('aria-live', tipo === 'erro' ? 'assertive' : 'polite');
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
          mostrarMensagem('Playlist excluída com sucesso.', 'sucesso');
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
    let ordemAlterada = false;

    container.replaceChildren();

    const painel = document.createElement('div');

    const titulo = document.createElement('h2');
    titulo.textContent = `Playlist: ${playlist.nome}`;

    const descricao = document.createElement('p');
    descricao.textContent = playlist.descricao || 'Sem descrição';

    const tituloMusicas = document.createElement('h4');
    tituloMusicas.textContent = 'Músicas na playlist:';

    const listaMusicas = document.createElement('ul');

    const botaoTocar = criarBotao('▶ Tocar Playlist', () => {
      if (musicas.length === 0) {
        mostrarMensagem('A playlist está vazia.');
        return;
      }

      tocar(musicas, 0);
    });
    botaoTocar.disabled = musicas.length === 0;

    const formularioEditar = document.createElement('form');
    formularioEditar.className = 'form-editar-playlist';

    const nomeEditado = document.createElement('input');
    nomeEditado.type = 'text';
    nomeEditado.value = playlist.nome;
    nomeEditado.maxLength = 100;
    nomeEditado.required = true;
    nomeEditado.setAttribute('aria-label', 'Nome da playlist');

    const descricaoEditada = document.createElement('input');
    descricaoEditada.type = 'text';
    descricaoEditada.value = playlist.descricao || '';
    descricaoEditada.maxLength = 500;
    descricaoEditada.placeholder = 'Descrição (opcional)';
    descricaoEditada.setAttribute('aria-label', 'Descrição da playlist');

    const botaoSalvarEdicao = document.createElement('button');
    botaoSalvarEdicao.type = 'submit';
    botaoSalvarEdicao.textContent = 'Salvar alterações';

    formularioEditar.append(nomeEditado, descricaoEditada, botaoSalvarEdicao);
    formularioEditar.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      botaoSalvarEdicao.disabled = true;

      try {
        await renomearPlaylist(
          playlist.id,
          nomeEditado.value.trim(),
          descricaoEditada.value.trim()
        );
        mostrarMensagem('Playlist atualizada com sucesso.', 'sucesso');
        await carregarPlaylists();
        await abrirPlaylist(playlist.id);
      } catch (erro) {
        mostrarMensagem(`Erro ao atualizar playlist: ${erro.message}`);
      } finally {
        botaoSalvarEdicao.disabled = false;
      }
    });

    const controlesOrdem = document.createElement('div');
    controlesOrdem.className = 'controles-ordem-playlist';
    const botaoSalvarOrdem = criarBotao('Salvar ordem', async () => {
      botaoSalvarOrdem.disabled = true;

      try {
        await reordenar(playlist.id, musicas.map((musica) => musica.id));
        mostrarMensagem('Ordem das músicas salva.', 'sucesso');
        await abrirPlaylist(playlist.id);
      } catch (erro) {
        mostrarMensagem(`Erro ao salvar a ordem: ${erro.message}`);
        botaoSalvarOrdem.disabled = false;
      }
    });
    botaoSalvarOrdem.disabled = true;

    function moverMusica(indice, deslocamento) {
      const novoIndice = indice + deslocamento;
      if (novoIndice < 0 || novoIndice >= musicas.length) return;

      [musicas[indice], musicas[novoIndice]] = [musicas[novoIndice], musicas[indice]];
      ordemAlterada = true;
      renderizarMusicas();
      botaoSalvarOrdem.disabled = false;
    }

    function renderizarMusicas() {
      listaMusicas.replaceChildren();

      if (musicas.length === 0) {
        const itemVazio = document.createElement('li');
        itemVazio.textContent = 'Nenhuma música adicionada ainda.';
        listaMusicas.appendChild(itemVazio);
        botaoTocar.disabled = true;
        botaoSalvarOrdem.disabled = true;
        return;
      }

      botaoTocar.disabled = false;
      musicas.forEach((musica, indice) => {
        const item = document.createElement('li');
        const nome = document.createElement('strong');
        nome.textContent = musica.nome;
        const formato = document.createTextNode(` (${musica.formato}) `);

        const botaoSubir = criarBotao('↑', () => moverMusica(indice, -1));
        botaoSubir.className = 'btn-mover-musica';
        botaoSubir.disabled = indice === 0;
        botaoSubir.setAttribute('aria-label', `Mover ${musica.nome} para cima`);

        const botaoDescer = criarBotao('↓', () => moverMusica(indice, 1));
        botaoDescer.className = 'btn-mover-musica';
        botaoDescer.disabled = indice === musicas.length - 1;
        botaoDescer.setAttribute('aria-label', `Mover ${musica.nome} para baixo`);

        const botaoRemover = criarBotao('Remover', async () => {
          try {
            if (ordemAlterada) {
              await reordenar(playlist.id, musicas.map((itemMusica) => itemMusica.id));
            }
            await removerMusica(playlist.id, musica.id);
            mostrarMensagem('Música removida da playlist.', 'sucesso');
            await abrirPlaylist(playlist.id);
            await carregarPlaylists();
          } catch (erro) {
            mostrarMensagem(`Erro ao remover música: ${erro.message}`);
          }
        });

        item.append(
          nome,
          formato,
          botaoSubir,
          botaoDescer,
          botaoRemover
        );
        listaMusicas.appendChild(item);
      });
    }

    renderizarMusicas();
    controlesOrdem.appendChild(botaoSalvarOrdem);

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
        mostrarMensagem('Música adicionada à playlist.', 'sucesso');
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
      formularioEditar,
      tituloMusicas,
      listaMusicas,
      controlesOrdem,
      botaoTocar,
      areaAdicionar
    );

    container.appendChild(painel);
  } catch (erro) {
    mostrarMensagem(`Erro ao abrir playlist: ${erro.message}`);
  }
}
