// frontend/src/pages/SongForm.js
import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const parseDuration = (input) => {
  if (!input) return undefined;
  // aceita "mm:ss" ou número de segundos
  const str = String(input).trim();
  if (/^\d+:\d{1,2}$/.test(str)) {
    const [m, s] = str.split(':').map(Number);
    if (Number.isNaN(m) || Number.isNaN(s)) return undefined;
    return m * 60 + s;
  }
  const n = Number(str);
  return Number.isNaN(n) ? undefined : n;
};

const formatDuration = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const total = Number(value);
  if (Number.isNaN(total)) return '';
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m)}:${String(s).padStart(2, '0')}`;
};

const SongForm = () => {
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [artistId, setArtistId] = useState('');
  const [trackNumber, setTrackNumber] = useState('');
  const [durationInput, setDurationInput] = useState(''); // exibe como "mm:ss" ou segundos
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchAlbums = async () => {
    try {
      const res = await api.get('/albums');
      setAlbums(res.data);
    } catch (err) {
      console.error('Erro ao carregar álbuns:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar lista de álbuns.');
      }
    }
  };

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

  const fetchSong = async (songId) => {
    try {
      const res = await api.get(`/songs/${songId}`);
      const s = res.data;
      setTitle(s.title || '');
      const aId =
        (s.albumId && (s.albumId._id || s.albumId.id || s.albumId)) ||
        (s.album && (s.album._id || s.album.id || s.album)) ||
        '';
      setAlbumId(aId);

      const arId =
        (s.artistId && (s.artistId._id || s.artistId.id || s.artistId)) ||
        (s.artist && (s.artist._id || s.artist.id || s.artist)) ||
        '';
      setArtistId(arId || '');

      if (s.duration !== undefined && s.duration !== null) {
        setDurationInput(formatDuration(s.duration));
      } else {
        setDurationInput('');
      }
      setTrackNumber(s.trackNumber || '');
    } catch (err) {
      console.error('Erro ao carregar música:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar dados da música.');
      }
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
    if (id) fetchSong(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Quando usuário muda o álbum, se o artista estiver vazio, tenta preencher com o artista do álbum (se vier populado)
  const selectedAlbum = useMemo(
    () => albums.find((a) => a._id === albumId),
    [albums, albumId]
  );

  useEffect(() => {
    if (!artistId && selectedAlbum) {
      const albArtist =
        selectedAlbum.artistId && (selectedAlbum.artistId._id || selectedAlbum.artistId.id || selectedAlbum.artistId);
      const albArtistObj = typeof albArtist === 'string' ? null : albArtist;
      const fallbackArtist =
        (selectedAlbum.artist && (selectedAlbum.artist._id || selectedAlbum.artist.id || selectedAlbum.artist)) ||
        albArtist ||
        '';
      if (fallbackArtist && typeof fallbackArtist === 'string') {
        setArtistId(fallbackArtist);
      } else if (albArtistObj && albArtistObj._id) {
        setArtistId(albArtistObj._id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlbum]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    // Validação dos campos obrigatórios
    if (!title.trim()) {
      setError('O título da música é obrigatório.');
      return;
    }

    if (!albumId) {
      setError('Selecione um álbum para a música.');
      return;
    }

    const duration = parseDuration(durationInput);
    if (durationInput && duration === undefined) {
      setError('Duração inválida. Use mm:ss ou segundos (ex.: 3:45 ou 225).');
      return;
    }

    const payload = {
      title,
      album_id: albumId, // requerido - convertido para o formato esperado pelo backend
      artist_id: artistId || undefined, // opcional, mas recomendado se o backend exigir
      track_number: trackNumber ? Number(trackNumber) : undefined,
      duration_seconds: duration, // em segundos - convertido para o formato esperado pelo backend
    };

    try {
      if (id) {
        await api.put(`/songs/${id}`, payload);
        setMessage('Música atualizada com sucesso!');
      } else {
        await api.post('/songs', payload);
        setMessage('Música criada com sucesso!');
      }
      setTimeout(() => navigate('/songs'), 1200);
    } catch (err) {
      console.error('Erro ao salvar música:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar música.');
      }
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>{id ? 'Editar Música' : 'Adicionar Nova Música'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>
            Título: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Time"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>
            Álbum: <span style={{ color: 'red' }}>*</span>
          </label>
          <select 
            value={albumId} 
            onChange={(e) => setAlbumId(e.target.value)} 
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione um álbum</option>
            {albums.map((alb) => (
              <option key={alb._id} value={alb._id}>
                {alb.title} {(alb.year ? `(${alb.year})` : '')}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>
            Artista:
          </label>
          <select 
            value={artistId} 
            onChange={(e) => setArtistId(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione um artista</option>
            {artists.map((art) => (
              <option key={art._id} value={art._id}>
                {art.name}
              </option>
            ))}
          </select>
          <small style={{ color: '#666', fontSize: '0.8rem' }}>Se não selecionado, será usado o artista do álbum</small>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Número da faixa:</label>
          <input
            type="number"
            min="1"
            value={trackNumber}
            onChange={(e) => setTrackNumber(e.target.value)}
            placeholder="Ex: 1"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Duração (mm:ss ou segundos):</label>
          <input
            type="text"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            placeholder="Ex: 3:45 ou 225"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>Formatos aceitos: mm:ss (3:45) ou segundos totais (225)</small>
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
            {id ? 'Salvar alterações' : 'Criar Música'}
          </button>
          <Link 
            to="/songs" 
            style={{ 
              marginLeft: '10px', 
              padding: '10px 15px', 
              backgroundColor: '#f1f1f1', 
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
      
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#dff0d8', 
          color: '#3c763d', 
          borderRadius: '4px' 
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f2dede', 
          color: '#a94442', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      
      <p style={{ marginTop: '20px' }}>
        <Link to="/songs" style={{ color: '#337ab7', textDecoration: 'none' }}>Voltar para a lista de músicas</Link>
      </p>
    </div>
  );
};

export default SongForm;
