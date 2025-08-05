require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Define a porta do servidor, padrão 5000

// Middlewares
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json()); // Habilita o parsing de JSON para requisições com body

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Streaming de Músicas funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
