// frontend/src/pages/SongList.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const formatDuration = (value) => {
  if (!value && value !== 0) return '';
  const total = Number(value);
  if (Number.isNaN(total)) return '';
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m)}:${String(s).padStart(2, '0')}`;
};

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSongs = async () => {
    try {
      const res = await api.get('/songs');
      setSongs(res.data);
    } catch (err) {
      console.error('Erro ao buscar músicas:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar músicas. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
      try {
        await api.delete(`/songs/${id}`);
        setSongs((prev) => prev.filter((s) => s._id !== id));
        alert('Música excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir música:', err);
        if (err.response && err.response.status === 401) {
          setError('Não autorizado. Faça login novamente para excluir.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Erro ao excluir música.');
        }
      }
    }
  };

  if (loading) return <p>Carregando músicas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Músicas</h2>
      <Link to="/songs/new">Adicionar Nova Música</Link>
      {songs.length === 0 ? (
        <p>Nenhuma música cadastrada ainda.</p>
      ) : (
        <ul>
          {songs.map((song) => {
            const albumRef = song.album_id || song.albumId || song.album;
            const artistRef = song.artist_id || song.artistId || song.artist;

            const albumTitle =
              typeof albumRef === 'string'
                ? 'Álbum não informado'
                : albumRef?.title || 'Álbum não informado';

            const artistName =
              typeof artistRef === 'string'
                ? (albumRef && typeof albumRef !== 'string' && albumRef.artist && (albumRef.artist.name || albumRef.artist.title)) || 'Artista não informado'
                : artistRef?.name || artistRef?.title || 'Artista não informado';

            return (
              <li key={song._id} style={{ marginBottom: 8 }}>
                <strong>{song.title}</strong>
                {song.track_number || song.trackNumber ? ` • Faixa ${song.track_number || song.trackNumber}` : ''}
                {song.duration_seconds || song.duration ? ` • ${formatDuration(song.duration_seconds || song.duration)}` : ''}
                {' — '}
                {artistName} • {albumTitle}
                <Link to={`/songs/edit/${song._id}`} style={{ marginLeft: 10 }}>Editar</Link>
                <button onClick={() => handleDelete(song._id)} style={{ marginLeft: 10 }}>
                  Excluir
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SongList;
