// backend/routes/artistRoutes.js
const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist'); // Importa o modelo Artist
const auth = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

/**
 * @route POST /api/artists
 * @desc Cria um novo artista
 * @access Private (requer autenticação)
 */
router.post('/', auth, async (req, res) => {
    const { name, bio, image_url } = req.body;

    if (!name) {
    return res.status(400).json({ message: 'O nome do artista é obrigatório.' });
    }

    try {
    const newArtist = await Artist.create(name, bio, image_url);
    res.status(201).json(newArtist);
    } catch (error) {
    console.error('Erro ao criar artista:', error);
    if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint (nome duplicado)
        return res.status(409).json({ message: 'Já existe um artista com este nome.' });
    }
    res.status(500).json({ message: 'Erro no servidor ao criar artista.' });
    }
});

/**
 * @route GET /api/artists
 * @desc Retorna todos os artistas
 * @access Private (requer autenticação)
 */
router.get('/', auth, async (req, res) => {
    try {
    const artists = await Artist.findAll();
    res.json(artists);
    } catch (error) {
    console.error('Erro ao buscar artistas:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar artistas.' });
    }
});

/**
 * @route GET /api/artists/:id
 * @desc Retorna um artista pelo ID
 * @access Private (requer autenticação)
 */
router.get('/:id', auth, async (req, res) => {
    try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
        return res.status(404).json({ message: 'Artista não encontrado.' });
    }
    res.json(artist);
    } catch (error) {
    console.error('Erro ao buscar artista por ID:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar artista.' });
    }
});

/**
 * @route PUT /api/artists/:id
 * @desc Atualiza um artista pelo ID
 * @access Private (requer autenticação)
 */
router.put('/:id', auth, async (req, res) => {
    const { name, bio, image_url } = req.body;
    const { id } = req.params;

    if (!name) {
    return res.status(400).json({ message: 'O nome do artista é obrigatório para atualização.' });
    }

    try {
    const updatedArtist = await Artist.update(id, name, bio, image_url);
    if (!updatedArtist) {
        return res.status(404).json({ message: 'Artista não encontrado para atualização.' });
    }
    res.json(updatedArtist);
    } catch (error) {
    console.error('Erro ao atualizar artista:', error);
    if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint
        return res.status(409).json({ message: 'Já existe outro artista com este nome.' });
    }
    res.status(500).json({ message: 'Erro no servidor ao atualizar artista.' });
    }
});

/**
 * @route DELETE /api/artists/:id
 * @desc Deleta um artista pelo ID
 * @access Private (requer autenticação)
 */
router.delete('/:id', auth, async (req, res) => {
    try {
    const isDeleted = await Artist.delete(req.params.id);
    if (!isDeleted) {
        return res.status(404).json({ message: 'Artista não encontrado para exclusão.' });
    }
    res.json({ message: 'Artista deletado com sucesso.' });
    } catch (error) {
    console.error('Erro ao deletar artista:', error);
    res.status(500).json({ message: 'Erro no servidor ao deletar artista.' });
    }
});

module.exports = router;
