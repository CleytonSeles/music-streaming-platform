// backend/routes/albumRoutes.js
const express = require('express');
const router = express.Router();
const Album = require('../models/Album'); // Importa o modelo Album
const Artist = require('../models/Artist'); // Importa o modelo Artist para validação
const auth = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

/**
 * @route POST /api/albums
 * @desc Cria um novo álbum
 * @access Private (requer autenticação)
 */
router.post('/', auth, async (req, res) => {
    const { title, artist_id, release_date, cover_image_url } = req.body;

    if (!title || !artist_id) {
        return res.status(400).json({ message: 'Título e ID do artista são obrigatórios.' });
    }

    try {
        // Valida se o artista existe
        const artistExists = await Artist.findById(artist_id);
        if (!artistExists) {
            return res.status(404).json({ message: 'Artista não encontrado.' });
        }

        const newAlbum = await Album.create(title, artist_id, release_date, cover_image_url);
        res.status(201).json(newAlbum);
    } catch (error) {
        console.error('Erro ao criar álbum:', error);
        if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint (título duplicado para o mesmo artista)
            return res.status(409).json({ message: 'Já existe um álbum com este título para este artista.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao criar álbum.' });
    }
});

/**
 * @route GET /api/albums
 * @desc Retorna todos os álbuns (opcionalmente filtrados por artist_id)
 * @access Private (requer autenticação)
 */
router.get('/', auth, async (req, res) => {
    const { artist_id } = req.query; // Pega o artist_id da query string (ex: /api/albums?artist_id=1)
    try {
        const albums = await Album.findAll(artist_id);
        res.json(albums);
    } catch (error) {
        console.error('Erro ao buscar álbuns:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar álbuns.' });
    }
});

/**
 * @route GET /api/albums/:id
 * @desc Retorna um álbum pelo ID
 * @access Private (requer autenticação)
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Álbum não encontrado.' });
        }
        res.json(album);
    } catch (error) {
        console.error('Erro ao buscar álbum por ID:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar álbum.' });
    }
});

/**
 * @route PUT /api/albums/:id
 * @desc Atualiza um álbum pelo ID
 * @access Private (requer autenticação)
 */
router.put('/:id', auth, async (req, res) => {
    const { title, artist_id, release_date, cover_image_url } = req.body;
    const { id } = req.params;

    if (!title || !artist_id) {
        return res.status(400).json({ message: 'Título e ID do artista são obrigatórios para atualização.' });
    }

    try {
        // Valida se o artista existe
        const artistExists = await Artist.findById(artist_id);
        if (!artistExists) {
            return res.status(404).json({ message: 'Artista associado não encontrado.' });
        }

        const updatedAlbum = await Album.update(id, title, artist_id, release_date, cover_image_url);
        if (!updatedAlbum) {
            return res.status(404).json({ message: 'Álbum não encontrado para atualização.' });
        }
        res.json(updatedAlbum);
    } catch (error) {
        console.error('Erro ao atualizar álbum:', error);
        if (error.code === '23505') { // Código de erro para violação de UNIQUE constraint
            return res.status(409).json({ message: 'Já existe outro álbum com este título para este artista.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao atualizar álbum.' });
    }
});

/**
 * @route DELETE /api/albums/:id
 * @desc Deleta um álbum pelo ID
 * @access Private (requer autenticação)
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const isDeleted = await Album.delete(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Álbum não encontrado para exclusão.' });
        }
        res.json({ message: 'Álbum deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar álbum:', error);
        res.status(500).json({ message: 'Erro no servidor ao deletar álbum.' });
    }
});

module.exports = router;
