// Configuração do Multer

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
 

const PASTA_UPLOADS = path.join(__dirname, '../../../uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });
 
const EXTENSOES_OK = ['.mp3', '.wav', '.ogg'];
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sufixo = crypto.randomBytes(4).toString('hex');
    cb(null, `${Date.now()}-${sufixo}${ext}`);
  },
});
 
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (EXTENSOES_OK.includes(ext)) return cb(null, true);
  const e = new Error('Formato não suportado. Envie .mp3, .wav ou .ogg.');
  e.status = 415;
  cb(e);
};
 
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, 
});
 
module.exports = upload;
