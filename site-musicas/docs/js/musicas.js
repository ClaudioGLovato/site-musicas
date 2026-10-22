// Pessoa 1: tela de upload e biblioteca de músicas
// TODO: input de arquivo, validar mp3/wav/ogg e tamanho, barra de progresso (XMLHttpRequest),
//       listar músicas, buscar por nome, excluir, botão "tocar" (chama tocar() do player.js)
import { API_URL } from './config.js';

const TAMANHO_MAXIMO_MB = 50;
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;
const FORMATOS_PERMITIDOS = ['audio/mpeg', 'audio/wav', 'audio/ogg', '.mp3', '.wav', '.ogg'];

const dropzone = document.getElementById('upload-zone');
const arquivoInput = document.getElementById('arquivo-input');
const btnSelecionar = document.getElementById('btn-selecionar');
const progressoContainer = document.getElementById('progresso-container');
const barraProgresso = document.getElementById('barra-progresso');
const textoProgresso = document.getElementById('texto-progresso');
const mensagemArea = document.getElementById('mensagem-area');
const listaMusicasBody = document.getElementById('lista-musicas-body');
const pesquisaInput = document.getElementById('pesquisa-input');

let musicasLocais = [];
let timerMensagem;

export function iniciarMusicas() {
    carregarMusicas();
    configurarEventosUpload();
    pesquisaInput.addEventListener('input', filtrarMusicas);
}

function mostrarMensagem(texto, tipo) {
    clearTimeout(timerMensagem);
    mensagemArea.textContent = texto;
    mensagemArea.className = `mensagem ${tipo}`;
    mensagemArea.classList.remove('oculto');
    timerMensagem = setTimeout(() => {
        mensagemArea.classList.add('oculto');
    }, 5000);
}

function configurarEventosUpload() {
    btnSelecionar.addEventListener('click', () => arquivoInput.click());
    arquivoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processarArquivo(e.target.files[0]);
    });
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processarArquivo(e.dataTransfer.files[0]);
    });
}

function processarArquivo(arquivo) {
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
        mostrarMensagem(`Erro: O ficheiro excede o limite de ${TAMANHO_MAXIMO_MB} MB.`, 'erro');
        arquivoInput.value = "";
        return;
    }
    const nomeArquivo = arquivo.name.toLowerCase();
    const formatoValido = FORMATOS_PERMITIDOS.some(ext => nomeArquivo.endsWith(ext) || arquivo.type === ext);
    if (!formatoValido) {
        mostrarMensagem('Erro: Formato não suportado. Use apenas MP3, WAV ou OGG.', 'erro');
        arquivoInput.value = "";
        return;
    }
    enviarMusica(arquivo);
}

function enviarMusica(arquivo) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/musicas`, true);

    progressoContainer.classList.remove('oculto');
    barraProgresso.style.width = '0%';
    textoProgresso.textContent = '0%';

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentual = Math.round((e.loaded / e.total) * 100);
            barraProgresso.style.width = percentual + '%';
            textoProgresso.textContent = percentual + '%';
        }
    });

    xhr.onload = function () {
        progressoContainer.classList.add('oculto');
        arquivoInput.value = "";
        try {
            const resposta = JSON.parse(xhr.responseText);
            if (xhr.status === 201 && resposta.sucesso) {
                mostrarMensagem('Música enviada com sucesso!', 'sucesso');
                musicasLocais.unshift(resposta.dados);
                renderizarTabela(musicasLocais);
            } else {
                mostrarMensagem(resposta.erro || 'Erro ao enviar a música.', 'erro');
            }
        } catch (err) {
            mostrarMensagem('Erro. Certifique-se de que a API backend está a correr em localhost:3000.', 'erro');
        }
    };
    xhr.onerror = function () {
        progressoContainer.classList.add('oculto');
        mostrarMensagem('Erro de rede. A API Node.js está a correr em localhost:3000?', 'erro');
    };
    xhr.send(formData);
}

async function carregarMusicas() {
    try {
        const resposta = await fetch(`${API_URL}/api/musicas`);
        const json = await resposta.json();
        if (resposta.ok && json.sucesso) {
            musicasLocais = json.dados;
            renderizarTabela(musicasLocais);
        } else {
            mostrarMensagem(json.erro || 'Erro ao carregar a biblioteca.', 'erro');
        }
    } catch (erro) {
        mostrarMensagem('Sem conexão à API. Inicie o backend (Node.js) em localhost:3000', 'erro');
    }
}

function filtrarMusicas() {
    const termo = pesquisaInput.value.toLowerCase();
    const musicasFiltradas = musicasLocais.filter(musica => 
        musica.nome.toLowerCase().includes(termo)
    );
    renderizarTabela(musicasFiltradas);
}

function renderizarTabela(musicas) {
    listaMusicasBody.innerHTML = '';
    if (musicas.length === 0) {
        listaMusicasBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma música encontrada.</td></tr>';
        return;
    }
    musicas.forEach(musica => {
        const tr = document.createElement('tr');
        const tamanhoFormatado = (musica.tamanho / (1024 * 1024)).toFixed(2) + ' MB';
        tr.innerHTML = `
            <td></td>
            <td>${musica.formato.toUpperCase()}</td>
            <td>${tamanhoFormatado}</td>
            <td>
                <button class="btn btn-tocar" data-id="${musica.id}">Tocar</button>
                <button class="btn btn-excluir" data-id="${musica.id}">Excluir</button>
            </td>
        `;
        tr.querySelector('td').textContent = musica.nome;
        listaMusicasBody.appendChild(tr);
    });
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => confirmarExclusao(e.target.dataset.id));
    });
    document.querySelectorAll('.btn-tocar').forEach(btn => {
        btn.addEventListener('click', (e) => dispararEventoTocar(e.target.dataset.id));
    });
}

async function confirmarExclusao(idStr) {
    const id = parseInt(idStr);
    const musica = musicasLocais.find(m => m.id === id);
    if (confirm(`Tem a certeza que deseja excluir "${musica.nome}"?`)) {
        try {
            const resposta = await fetch(`${API_URL}/api/musicas/${id}`, { method: 'DELETE' });
            const json = await resposta.json();
            if (resposta.ok && json.sucesso) {
                mostrarMensagem('Música excluída com sucesso.', 'sucesso');
                musicasLocais = musicasLocais.filter(m => m.id !== id);
                filtrarMusicas();
            } else {
                mostrarMensagem(json.erro || 'Erro ao excluir.', 'erro');
            }
        } catch (erro) {
            mostrarMensagem('Erro de comunicação ao excluir.', 'erro');
        }
    }
}

function dispararEventoTocar(idStr) {
    const id = parseInt(idStr);
    const musica = musicasLocais.find(m => m.id === id);
    const evento = new CustomEvent('tocarMusicaRequisitada', { detail: musica });
    document.dispatchEvent(evento);
    console.log("Evento 'tocarMusicaRequisitada' disparado:", musica);
}
