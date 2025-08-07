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

    // Validação no frontend para garantir que todos os campos obrigatórios estão preenchidos
    if (!title.trim()) {
      setError('Por favor, informe o título do álbum.');
      return;
    }

    if (!artistId) {
      setError('Por favor, selecione um artista.');
      return;
    }

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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>{id ? 'Editar Álbum' : 'Adicionar Novo Álbum'}</h2>
      {error && <p style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '5px', marginBottom: '15px' }}>{error}</p>}
      {message && <p style={{ color: 'green', padding: '10px', backgroundColor: '#eeffee', borderRadius: '5px', marginBottom: '15px' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Título: <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: The Dark Side of the Moon"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Ano:</label>
          <input
            type="number"
            min="1900"
            max={currentYear + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={`Ex: ${currentYear}`}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Artista: <span style={{ color: 'red' }}>*</span></label>
          <select 
            value={artistId} 
            onChange={(e) => setArtistId(e.target.value)} 
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione um artista</option>
            {artists.map((artist) => (
              <option key={artist._id} value={artist._id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button 
            type="submit" 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {id ? 'Salvar alterações' : 'Criar Álbum'}
          </button>
          <Link 
            to="/albums" 
            style={{ 
              marginLeft: '10px', 
              padding: '10px 15px', 
              backgroundColor: '#f0f0f0', 
              color: '#333', 
              textDecoration: 'none', 
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
        <span style={{ color: 'red' }}>*</span> Campos obrigatórios
      </p>
    </div>
  );
};

export default AlbumForm;
