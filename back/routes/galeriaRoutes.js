// routes/galeriaRoutes.js
const express = require('express');
const router = express.Router();

// CORREÇÃO AQUI: Verifique se o nome do seu arquivo na pasta controllers é 'galleryController.js'
const GalleryController = require('../controllers/galleryController'); 

const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard', GalleryController.dashboard);
router.get('/', GalleryController.getAll);
router.post('/', authMiddleware, GalleryController.create);
router.put('/:id', authMiddleware, GalleryController.update);
router.delete('/:id', authMiddleware, GalleryController.delete);
router.post('/:id/participate', authMiddleware, GalleryController.participate);
router.get('/my-events', authMiddleware, GalleryController.myParticipations);

module.exports = router;