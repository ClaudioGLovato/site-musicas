
// Pessoa 3: player de áudio fixo no rodapé
import { API_URL } from './config.js';

let audio = new Audio();
let playlistAtual = [];
let indiceAtual = 0;

// Modos de loop: 'off' (desligado), 'one' (repetir música), 'all' (repetir playlist)
let modoLoop = 'off'; 

export function iniciarPlayer() {
  const containerPlayer = document.getElementById('player');
  if (!containerPlayer) return;

  // Injeta dinamicamente a interface do Player no HTML
  containerPlayer.innerHTML = `
    <div class="player-info">
      <span id="player-nome">Nenhuma música selecionada</span>
    </div>

    <div class="player-controles">
      <button id="btn-loop" class="btn-player" title="Modo de Repetição (Desligado)">🔁 <span>Off</span></button>
      <button id="btn-anterior" class="btn-player" title="Anterior">⏮</button>
      <button id="btn-play-pause" class="btn-player" title="Tocar / Pausar">▶</button>
      <button id="btn-proxima" class="btn-player" title="Próxima">⏭</button>
    </div>

    <div class="player-progresso-area">
      <span id="tempo-atual">0:00</span>
      <input type="range" id="barra-progresso-player" value="0" min="0" max="100" step="0.1">
      <span id="tempo-total">0:00</span>
    </div>

    <div class="player-volume-area">
      <span>🔊</span>
      <input type="range" id="barra-volume" value="1" min="0" max="1" step="0.05">
    </div>
  `;

  configurarEventos();
}

function configurarEventos() {
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProxima = document.getElementById('btn-proxima');
  const btnLoop = document.getElementById('btn-loop');
  const barraProgresso = document.getElementById('barra-progresso-player');
  const barraVolume = document.getElementById('barra-volume');

  // Controles de clique
  btnPlayPause.addEventListener('click', alternarPlayPause);
  btnAnterior.addEventListener('click', musicaAnterior);
  btnProxima.addEventListener('click', proximaMusica);
  btnLoop.addEventListener('click', alternarModoLoop);

  // Alterar tempo da música pela barra de progresso
  barraProgresso.addEventListener('input', (e) => {
    if (audio.duration) {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    }
  });

  // Controle de Volume
  barraVolume.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });

  // Atualização continuada da barra de progresso e tempos
  audio.addEventListener('timeupdate', atualizarProgresso);
  audio.addEventListener('ended', aoFinalizarMusica);

  // Escuta o evento disparado pelo botão "Tocar" da tela de Músicas (Pessoa 1)
  document.addEventListener('tocarMusicaRequisitada', (e) => {
    const musica = e.detail;
    if (musica) {
      tocar([musica], 0);
    }
  });
}

/**
 * Função exportada para que outras telas/módulos possam tocar uma lista de músicas
 * @param {Array} listaDeMusicas - Array de objetos de música vindos do banco/API
 * @param {Number} indiceInicial - Índice da música por onde começar
 */
export function tocar(listaDeMusicas, indiceInicial = 0) {
  if (!listaDeMusicas || listaDeMusicas.length === 0) return;

  playlistAtual = listaDeMusicas;
  indiceAtual = indiceInicial;

  carregarETocarAtual();
}

function carregarETocarAtual() {
  const musica = playlistAtual[indiceAtual];
  if (!musica) return;

  // Monta a URL completa utilizando a API_URL
  const urlAudio = musica.url.startsWith('http') ? musica.url : `${API_URL}${musica.url}`;
  
  audio.src = urlAudio;
  audio.play()
    .then(() => {
      atualizarInterfacePlayPause(true);
    })
    .catch((err) => {
  atualizarInterfacePlayPause(false);
  console.error('Erro ao tocar áudio:', err);
  });

  document.getElementById('player-nome').textContent = musica.nome;
}

function alternarPlayPause() {
  if (!audio.src) return;

  if (audio.paused) {
  audio.play()
    .then(() => {
      atualizarInterfacePlayPause(true);
    })
    .catch((err) => {
      atualizarInterfacePlayPause(false);
      console.error('Erro ao tocar áudio:', err);
    });
} else {
  audio.pause();
  atualizarInterfacePlayPause(false);
}
}

function atualizarInterfacePlayPause(estaTocando) {
  const btn = document.getElementById('btn-play-pause');
  if (btn) {
    btn.textContent = estaTocando ? '⏸' : '▶';
  }
}

function proximaMusica() {
  if (playlistAtual.length === 0) return;

  if (indiceAtual < playlistAtual.length - 1) {
    indiceAtual++;
    carregarETocarAtual();
  } else if (modoLoop === 'all') {
    indiceAtual = 0;
    carregarETocarAtual();
  }
}

function musicaAnterior() {
  if (playlistAtual.length === 0) return;

  if (audio.currentTime > 3) {
    // Se a música já passou dos 3 segundos, apenas reinicia ela
    audio.currentTime = 0;
  } else if (indiceAtual > 0) {
    indiceAtual--;
    carregarETocarAtual();
  } else if (modoLoop === 'all') {
    indiceAtual = playlistAtual.length - 1;
    carregarETocarAtual();
  }
}

function alternarModoLoop() {
  const btnLoop = document.getElementById('btn-loop');
  if (modoLoop === 'off') {
    modoLoop = 'all';
    btnLoop.title = 'Modo de Repetição (Repetir Tudo)';
    btnLoop.querySelector('span').textContent = 'Tudo';
  } else if (modoLoop === 'all') {
    modoLoop = 'one';
    btnLoop.title = 'Modo de Repetição (Repetir Música)';
    btnLoop.querySelector('span').textContent = '1';
  } else {
    modoLoop = 'off';
    btnLoop.title = 'Modo de Repetição (Desligado)';
    btnLoop.querySelector('span').textContent = 'Off';
  }
}

function aoFinalizarMusica() {
  if (modoLoop === 'one') {
    carregarETocarAtual();
  } else if (indiceAtual < playlistAtual.length - 1 || modoLoop === 'all') {
    proximaMusica();
  } else {
    audio.currentTime = 0;
    atualizarProgresso();
    atualizarInterfacePlayPause(false);
  }
}

function atualizarProgresso() {
  const barra = document.getElementById('barra-progresso-player');
  const tempoAtualSpan = document.getElementById('tempo-atual');
  const tempoTotalSpan = document.getElementById('tempo-total');

  if (audio.duration) {
    const percentual = (audio.currentTime / audio.duration) * 100;
    barra.value = percentual;

    tempoAtualSpan.textContent = formatarTempo(audio.currentTime);
    tempoTotalSpan.textContent = formatarTempo(audio.duration);
  } else {
    barra.value = 0;
    tempoAtualSpan.textContent = '0:00';
    tempoTotalSpan.textContent = '0:00';
  }
}

function formatarTempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}