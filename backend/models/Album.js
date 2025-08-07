// backend/models/Album.js
const pool = require('../db');

class Album {
    /**
     * Cria um novo álbum no banco de dados.
     * @param {string} title - O título do álbum.
     * @param {number} artistId - O ID do artista associado.
     * @param {string} [releaseDate] - A data de lançamento do álbum (formato 'YYYY-MM-DD').
     * @param {string} [coverImageUrl] - A URL da imagem da capa do álbum.
     * @returns {Promise<Object>} - O objeto do álbum criado.
     */
    static async create(title, artistId, releaseDate = null, coverImageUrl = null) {
        const result = await pool.query(
            `INSERT INTO albums (title, artist_id, release_date, cover_image_url)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, artistId, releaseDate, coverImageUrl]
        );
        return result.rows[0];
    }

    /**
     * Retorna todos os álbuns, opcionalmente filtrados por artista.
     * @param {number} [artistId] - Opcional. ID do artista para filtrar álbuns.
     * @returns {Promise<Array>} - Um array de objetos de álbuns.
     */
    static async findAll(artistId = null) {
        let query = 'SELECT * FROM albums';
        const params = [];
        if (artistId) {
            query += ' WHERE artist_id = $1';
            params.push(artistId);
        }
        query += ' ORDER BY title ASC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Encontra um álbum pelo ID.
     * @param {number} id - O ID do álbum.
     * @returns {Promise<Object|null>} - O objeto do álbum ou null se não for encontrado.
     */
    static async findById(id) {
        const result = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Atualiza as informações de um álbum.
     * @param {number} id - O ID do álbum a ser atualizado.
     * @param {string} title - Novo título do álbum.
     * @param {number} artistId - Novo ID do artista associado.
     * @param {string} [releaseDate] - Nova data de lançamento.
     * @param {string} [coverImageUrl] - Nova URL da imagem da capa.
     * @returns {Promise<Object|null>} - O objeto do álbum atualizado ou null se não for encontrado.
     */
    static async update(id, title, artistId, releaseDate = null, coverImageUrl = null) {
        const result = await pool.query(
            `UPDATE albums SET
             title = $1,
             artist_id = $2,
             release_date = $3,
             cover_image_url = $4,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [title, artistId, releaseDate, coverImageUrl, id]
        );
        return result.rows[0] || null;
    }

    /**
     * Deleta um álbum pelo ID.
     * @param {number} id - O ID do álbum a ser deletado.
     * @returns {Promise<boolean>} - True se o álbum foi deletado, false caso contrário.
     */
    static async delete(id) {
        const result = await pool.query('DELETE FROM albums WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = Album;
