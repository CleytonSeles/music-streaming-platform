// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Importa as rotas de autenticação
const artistRoutes = require('./routes/artistRoutes'); // Importa as rotas de artista
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes); // Usa as rotas de autenticação sob o prefixo /api/auth
app.use('/api/artists', artistRoutes); // Usa as rotas de artista

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Streaming de Músicas funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
