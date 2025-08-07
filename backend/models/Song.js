// backend/models/Song.js
const pool = require('../db');

class Song {
    /**
     * Cria uma nova música no banco de dados.
     * @param {string} title - O título da música.
     * @param {number} albumId - O ID do álbum associado.
     * @param {number} [durationSeconds] - A duração da música em segundos.
     * @param {number} [trackNumber] - O número da faixa no álbum.
     * @returns {Promise<Object>} - O objeto da música criada.
     */
    static async create(title, albumId, durationSeconds = null, trackNumber = null) {
        const result = await pool.query(
            `INSERT INTO songs (title, album_id, duration_seconds, track_number)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, albumId, durationSeconds, trackNumber]
        );
        return result.rows[0];
    }

    /**
     * Retorna todas as músicas, opcionalmente filtradas por álbum.
     * @param {number} [albumId] - Opcional. ID do álbum para filtrar músicas.
     * @returns {Promise<Array>} - Um array de objetos de músicas.
     */
    static async findAll(albumId = null) {
        let query = 'SELECT * FROM songs';
        const params = [];
        if (albumId) {
            query += ' WHERE album_id = $1';
            params.push(albumId);
        }
        query += ' ORDER BY track_number ASC, title ASC'; // Ordena por número da faixa e depois por título
        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Encontra uma música pelo ID.
     * @param {number} id - O ID da música.
     * @returns {Promise<Object|null>} - O objeto da música ou null se não for encontrado.
     */
    static async findById(id) {
        const result = await pool.query('SELECT * FROM songs WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Atualiza as informações de uma música.
     * @param {number} id - O ID da música a ser atualizada.
     * @param {string} title - Novo título da música.
     * @param {number} albumId - Novo ID do álbum associado.
     * @param {number} [durationSeconds] - Nova duração.
     * @param {number} [trackNumber] - Novo número da faixa.
     * @returns {Promise<Object|null>} - O objeto da música atualizada ou null se não for encontrado.
     */
    static async update(id, title, albumId, durationSeconds = null, trackNumber = null) {
        const result = await pool.query(
            `UPDATE songs SET
             title = $1,
             album_id = $2,
             duration_seconds = $3,
             track_number = $4,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [title, albumId, durationSeconds, trackNumber, id]
        );
        return result.rows[0] || null;
    }

    /**
     * Deleta uma música pelo ID.
     * @param {number} id - O ID da música a ser deletada.
     * @returns {Promise<boolean>} - True se a música foi deletada, false caso contrário.
     */
    static async delete(id) {
        const result = await pool.query('DELETE FROM songs WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = Song;
