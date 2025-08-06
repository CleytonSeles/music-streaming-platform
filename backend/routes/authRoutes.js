// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Cria um novo roteador Express
const User = require('../models/User'); // Importa o modelo de usuário

/**
 * @route POST /api/auth/register
 * @desc Registra um novo usuário
 * @access Public
 */
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body; // Pega os dados do corpo da requisição

    // Validação básica de entrada
    if (!username || !email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    // Validação de formato de email (simples, pode ser mais robusta)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    // Validação de complexidade da senha (exemplo: mínimo 6 caracteres)
    if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    try {
    // Tenta criar o usuário no banco de dados
    const newUser = await User.create(username, email, password);

    // Retorna uma resposta de sucesso
    res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
        }
    });
    } catch (error) {
    // Captura erros específicos do modelo (ex: usuário/email já existe)
    if (error.message.includes('Nome de usuário já existe') || error.message.includes('Email já cadastrado')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário.' });
    }
});

module.exports = router;
