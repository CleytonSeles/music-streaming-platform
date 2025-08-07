// frontend/src/pages/AlbumForm.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

const AlbumForm = () => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [artistId, setArtistId] = useState('');
  const [artists, setArtists] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchArtists = async () => {
    try {
      const res = await api.get('/artists');
      setArtists(res.data);
    } catch (err) {
      console.error('Erro ao carregar artistas:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar lista de artistas.');
      }
    }
  };

  const fetchAlbum = async (albumId) => {
    try {
      const res = await api.get(`/albums/${albumId}`);
      const alb = res.data;
      setTitle(alb.title || '');
      setYear(alb.year || alb.releaseYear || '');

      // Suporta tanto artistId (objeto ou string) quanto artist (objeto ou string)
      const aId =
        (alb.artistId && (alb.artistId._id || alb.artistId.id || alb.artistId)) ||
        (alb.artist && (alb.artist._id || alb.artist.id || alb.artist)) ||
        '';
      setArtistId(aId);
    } catch (err) {
      console.error('Erro ao carregar álbum:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar dados do álbum.');
      }
    }
  };

  useEffect(() => {
    fetchArtists();
    if (id) fetchAlbum(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    const payload = {
      title,
      artist_id: artistId, // Ajustado para usar artist_id conforme esperado pelo backend
      release_date: year ? `${year}-01-01` : undefined, // Convertendo year para formato de data
    };

    try {
      if (id) {
        await api.put(`/albums/${id}`, payload);
        setMessage('Álbum atualizado com sucesso!');
      } else {
        await api.post('/albums', payload);
        setMessage('Álbum criado com sucesso!');
      }
      setTimeout(() => navigate('/albums'), 1200);
    } catch (err) {
      console.error('Erro ao salvar álbum:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar álbum.');
      }
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>{id ? 'Editar Álbum' : 'Adicionar Novo Álbum'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: The Dark Side of the Moon"
          />
        </div>
        <div>
          <label>Ano:</label>
          <input
            type="number"
            min="1900"
            max={currentYear + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={`Ex: ${currentYear}`}
          />
        </div>
        <div>
          <label>Artista:</label>
          <select value={artistId} onChange={(e) => setArtistId(e.target.value)} required>
            <option value="">Selecione um artista</option>
            {artists.map((artist) => (
              <option key={artist._id} value={artist._id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{id ? 'Salvar alterações' : 'Criar Álbum'}</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        <Link to="/albums">Voltar para a lista de álbuns</Link>
      </p>
    </div>
  );
};

export default AlbumForm;
