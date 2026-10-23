// Montagem do Express
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database/inicializar');
const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/erros');

const app = express();

//  Montagem do CORS
const origens = [process.env.FRONTEND_URL, 'http://localhost:5500', 'http://127.0.0.1:5500']
  .filter(Boolean);
app.use(cors({ origin: origens }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/musicas', require('./modulos/musicas/musicas.routes'));
app.use('/api/playlists', require('./modulos/playlists/playlists.routes'));

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

module.exports = app;
