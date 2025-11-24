// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'chave-secretad'; // Use o mesmo JWT_SECRET do seu AuthController

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Anexa o ID do usuário à requisição, tornando-o acessível no Controller
        req.userId = decoded.id; 
        next(); // 🟢 Permite que a requisição prossiga
    } catch (ex) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;