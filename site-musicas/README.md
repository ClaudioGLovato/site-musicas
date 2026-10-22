# Site de Músicas

Enviar músicas, montar playlists e tocar em loop.

- `docs/` = o site (frontend). O GitHub Pages publica esta pasta.
- `backend/` = o servidor (Node.js, Express, Multer, SQLite).

## Rodar o backend
```
cd backend
npm install express cors multer better-sqlite3 dotenv
npm install --save-dev nodemon
copy .env.example para .env   (no Linux/Mac: cp .env.example .env)
npm run dev
```
Teste em http://localhost:3000/api/musicas (deve aparecer `{"sucesso":true,"dados":[]}`).

## Rodar o site
Abra a pasta `docs` no VS Code e clique em "Go Live" (extensão Live Server).

## Quem faz o quê (procure os comentários TODO)
| Pessoa | Frontend | Backend |
|---|---|---|
| 1 | js/musicas.js, css/musicas.css | src/modulos/musicas/* |
| 2 | js/playlists.js, css/playlists.css | src/modulos/playlists/* |
| 3 | index.html, js/config.js, api.js, app.js, player.js, css/global.css, css/player.css | server.js, app.js, database/*, middlewares/*, utils/* |

## Publicar o site
Settings > Pages > Deploy from a branch > main > pasta /docs > Save.
Depois troque `API_URL` em `docs/js/config.js` pelo endereço do backend online.
