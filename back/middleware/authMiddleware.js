const jwt = require('jsonwebtoken');

const JWT_SECRET = 'chave-secretad'; 

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.userId = decoded.id; 
        next(); 
    } catch (ex) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;