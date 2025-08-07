// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const artistRoutes = require('./routes/artistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const songRoutes = require('./routes/songRoutes'); // Importa as rotas de música

// Middleware
app.use(cors());
app.use(express.json());

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes); // Usa as rotas de música

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
