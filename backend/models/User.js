// backend/models/User.js
const db = require('../db'); // Importa o módulo de conexão com o banco de dados
const bcrypt = require('bcrypt'); // Importa a biblioteca bcrypt para hashing de senhas

const User = {
    /**
     * Cria um novo usuário no banco de dados.
     * @param {string} username - O nome de usuário.
     * @param {string} email - O email do usuário.
     * @param {string} password - A senha em texto puro (será hashed antes de salvar).
     * @returns {Promise<object>} - O usuário criado (sem a senha hashed).
     */
    create: async (username, email, password) => {
    try {
        // Gerar o hash da senha
        const saltRounds = 10; // Número de rounds para o hashing (quanto maior, mais seguro, mas mais lento)
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Inserir o novo usuário no banco de dados
        const result = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, passwordHash]
        );

        return result.rows[0]; // Retorna o primeiro (e único) registro inserido
    } catch (error) {
        // Se o erro for de violação de unicidade (username ou email já existem)
        if (error.code === '23505') { // Código de erro para violação de unicidade no PostgreSQL
        if (error.detail.includes('username')) {
            throw new Error('Nome de usuário já existe.');
        }
        if (error.detail.includes('email')) {
            throw new Error('Email já cadastrado.');
        }
        }
        console.error('Erro ao criar usuário:', error);
        throw new Error('Erro interno ao criar usuário.');
    }
    },

    /**
     * Encontra um usuário pelo email.
     * @param {string} email - O email do usuário a ser encontrado.
     * @returns {Promise<object|null>} - O usuário encontrado ou null se não existir.
     */
    findByEmail: async (email) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0]; // Retorna o primeiro usuário encontrado ou undefined/null
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error);
        throw new Error('Erro interno ao buscar usuário.');
    }
    },

    /**
     * Compara uma senha em texto puro com um hash de senha.
     * @param {string} password - A senha em texto puro.
     * @param {string} hash - O hash da senha armazenado.
     * @returns {Promise<boolean>} - True se as senhas coincidirem, false caso contrário.
     */
    comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
    }
};

module.exports = User;
