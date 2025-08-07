// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar o token JWT em requisições protegidas.
 * O token deve ser enviado no cabeçalho 'x-auth-token'.
 */
module.exports = function(req, res, next) {
    // Obter o token do cabeçalho
    const token = req.header('x-auth-token');

    // Verificar se não há token
    if (!token) {
    return res.status(401).json({ message: 'Nenhum token, autorização negada.' });
    }

    try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar o usuário do payload do token ao objeto de requisição
    // Isso permite que as rotas subsequentes acessem req.user.id
    req.user = decoded.user;
    next(); // Chamar a próxima função de middleware/rota
    } catch (err) {
    // Token inválido ou expirado
    res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};
