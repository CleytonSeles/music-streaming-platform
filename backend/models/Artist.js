// backend/models/Artist.js
const pool = require('../db'); // Importa a conexão com o banco de dados

class Artist {
    /**
     * Cria um novo artista no banco de dados.
     * @param {string} name - Nome do artista.
     * @param {string} [bio] - Biografia do artista (opcional).
     * @param {string} [imageUrl] - URL da imagem do artista (opcional).
     * @returns {Promise<Object>} - O objeto do artista criado.
     */
    static async create(name, bio = null, imageUrl = null) {
    const result = await pool.query(
        'INSERT INTO artists (name, bio, image_url) VALUES ($1, $2, $3) RETURNING *',
        [name, bio, imageUrl]
    );
    return result.rows[0];
    }

    /**
     * Retorna todos os artistas do banco de dados.
     * @returns {Promise<Array>} - Um array de objetos de artista.
     */
    static async findAll() {
    const result = await pool.query('SELECT * FROM artists ORDER BY name ASC');
    return result.rows;
    }

    /**
     * Encontra um artista pelo ID.
     * @param {number} id - O ID do artista.
     * @returns {Promise<Object|null>} - O objeto do artista ou null se não for encontrado.
     */
    static async findById(id) {
    const result = await pool.query('SELECT * FROM artists WHERE id = $1', [id]);
    return result.rows[0] || null;
    }

    /**
     * Atualiza as informações de um artista.
     * @param {number} id - O ID do artista a ser atualizado.
     * @param {string} name - Novo nome do artista.
     * @param {string} [bio] - Nova biografia do artista (opcional).
     * @param {string} [imageUrl] - Nova URL da imagem do artista (opcional).
     * @returns {Promise<Object|null>} - O objeto do artista atualizado ou null se não for encontrado.
     */
    static async update(id, name, bio = null, imageUrl = null) {
    const result = await pool.query(
        `UPDATE artists SET
        name = $1,
        bio = $2,
        image_url = $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *`,
        [name, bio, imageUrl, id]
    );
    return result.rows[0] || null;
    }

    /**
     * Deleta um artista pelo ID.
     * @param {number} id - O ID do artista a ser deletado.
     * @returns {Promise<boolean>} - True se o artista foi deletado, false caso contrário.
     */
    static async delete(id) {
    const result = await pool.query('DELETE FROM artists WHERE id = $1', [id]);
    return result.rowCount > 0;
    }
}

module.exports = Artist;
