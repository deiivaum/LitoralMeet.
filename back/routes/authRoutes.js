const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.put('/perfil/:id', AuthController.attPerfil);
router.delete('/perfil/:id', AuthController.apagarPerfil);
router.post('/rate', authMiddleware, AuthController.createRating);


module.exports = router;