// ARQUIVO: back/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 

// --- ROTAS DE LOGIN/REGISTRO (Ajustadas para o Frontend) ---
// Adicionamos '/auth' aqui para bater com o seu HTML antigo
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);

// --- ROTAS DE PERFIL ---
router.get('/users/me', authMiddleware, AuthController.getPerfil);
router.put('/users/me', authMiddleware, AuthController.attPerfil);
router.delete('/users/me', authMiddleware, AuthController.apagarPerfil);

module.exports = router;