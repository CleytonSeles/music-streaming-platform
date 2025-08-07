// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Cria um novo roteador Express
const User = require('../models/User'); // Importa o modelo de usuário
const jwt = require('jsonwebtoken'); // Importa a biblioteca jsonwebtoken
const auth = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

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

/**
 * @route POST /api/auth/login
 * @desc Autentica um usuário e retorna um token JWT
 * @access Public
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validação básica de entrada
    if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
    // 1. Encontrar o usuário pelo email
    const user = await User.findByEmail(email);
    if (!user) {
        return res.status(400).json({ message: 'Credenciais inválidas.' }); // Email não encontrado
    }

    // 2. Comparar a senha fornecida com o hash armazenado
    const isMatch = await User.comparePassword(password, user.password_hash);
    if (!isMatch) {
        return res.status(400).json({ message: 'Credenciais inválidas.' }); // Senha incorreta
    }

    // 3. Se as credenciais estiverem corretas, gerar um token JWT
    const payload = {
        user: {
        id: user.id,
        email: user.email // Opcional: incluir email no payload
        }
    };

    // Assinar o token com a chave secreta e definir um tempo de expiração
    jwt.sign(
        payload,
        process.env.JWT_SECRET, // Nossa chave secreta do .env
        { expiresIn: '1h' }, // O token expira em 1 hora
        (err, token) => {
        if (err) throw err;
        res.json({
            message: 'Login bem-sucedido!',
            token, // Envia o token para o cliente
            user: {
            id: user.id,
            username: user.username,
            email: user.email
            }
        });
        }
    );

    } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor ao autenticar usuário.' });
    }
});

/**
 * @route GET /api/auth/protected
 * @desc Rota de teste protegida para usuários autenticados
 * @access Private
 */
router.get('/protected', auth, async (req, res) => {
    try {
    // req.user.id está disponível graças ao middleware 'auth'
    // Em uma aplicação real, você buscaria mais dados do usuário ou recursos relacionados
    res.json({
        message: 'Você acessou uma rota protegida!',
        userId: req.user.id,
        userEmail: req.user.email // O email também está no payload que adicionamos
    });
    } catch (error) {
    console.error('Erro na rota protegida:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
