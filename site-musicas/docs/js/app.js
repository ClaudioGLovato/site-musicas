// liga tudo e controla a troca de abas
import { iniciarMusicas } from './musicas.js';
import { iniciarPlaylists } from './playlists.js';
import { iniciarPlayer } from './player.js';

document.querySelectorAll('nav button').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((b) => b.classList.remove('ativo'));
    botao.classList.add('ativo');
    document.querySelectorAll('main section').forEach((s) => (s.hidden = true));
    document.getElementById(`tela-${botao.dataset.tela}`).hidden = false;
  });
});

iniciarMusicas();
iniciarPlaylists();
iniciarPlayer();
