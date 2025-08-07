// backend/routes/songRoutes.js
const express = require('express');
const router = express.Router();
const Song = require('../models/Song'); // Importa o modelo Song
const Album = require('../models/Album'); // Importa o modelo Album para validação
const auth = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

/**
 * @route POST /api/songs
 * @desc Cria uma nova música
 * @access Private (requer autenticação)
 */
router.post('/', auth, async (req, res) => {
    const { title, album_id, duration_seconds, track_number } = req.body;

    if (!title || !album_id) {
        return res.status(400).json({ message: 'Título e ID do álbum são obrigatórios.' });
    }

    try {
        // Valida se o álbum existe
        const albumExists = await Album.findById(album_id);
        if (!albumExists) {
            return res.status(404).json({ message: 'Álbum não encontrado.' });
        }

        const newSong = await Song.create(title, album_id, duration_seconds, track_number);
        res.status(201).json(newSong);
    } catch (error) {
        console.error('Erro ao criar música:', error);
        if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint (título duplicado para o mesmo álbum)
            return res.status(409).json({ message: 'Já existe uma música com este título para este álbum.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao criar música.' });
    }
});

/**
 * @route GET /api/songs
 * @desc Retorna todas as músicas (opcionalmente filtradas por album_id)
 * @access Private (requer autenticação)
 */
router.get('/', auth, async (req, res) => {
    const { album_id } = req.query; // Pega o album_id da query string (ex: /api/songs?album_id=1)
    try {
        const songs = await Song.findAll(album_id);
        res.json(songs);
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar músicas.' });
    }
});

/**
 * @route GET /api/songs/:id
 * @desc Retorna uma música pelo ID
 * @access Private (requer autenticação)
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Música não encontrada.' });
        }
        res.json(song);
    } catch (error) {
        console.error('Erro ao buscar música por ID:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar música.' });
    }
});

/**
 * @route PUT /api/songs/:id
 * @desc Atualiza uma música pelo ID
 * @access Private (requer autenticação)
 */
router.put('/:id', auth, async (req, res) => {
    const { title, album_id, duration_seconds, track_number } = req.body;
    const { id } = req.params;

    if (!title || !album_id) {
        return res.status(400).json({ message: 'Título e ID do álbum são obrigatórios para atualização.' });
    }

    try {
        // Valida se o álbum existe
        const albumExists = await Album.findById(album_id);
        if (!albumExists) {
            return res.status(404).json({ message: 'Álbum associado não encontrado.' });
        }

        const updatedSong = await Song.update(id, title, album_id, duration_seconds, track_number);
        if (!updatedSong) {
            return res.status(404).json({ message: 'Música não encontrada para atualização.' });
        }
        res.json(updatedSong);
    } catch (error) {
        console.error('Erro ao atualizar música:', error);
        if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint
            return res.status(409).json({ message: 'Já existe outra música com este título para este álbum.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao atualizar música.' });
    }
});

/**
 * @route DELETE /api/songs/:id
 * @desc Deleta uma música pelo ID
 * @access Private (requer autenticação)
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const isDeleted = await Song.delete(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Música não encontrada para exclusão.' });
        }
        res.json({ message: 'Música deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar música:', error);
        res.status(500).json({ message: 'Erro no servidor ao deletar música.' });
    }
});

module.exports = router;
