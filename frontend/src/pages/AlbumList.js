// frontend/src/pages/AlbumList.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAlbums = async () => {
    try {
      // Buscar álbuns com informações dos artistas
      const res = await api.get('/albums');
      const albumsData = res.data;
      
      // Se os álbuns não tiverem informações completas dos artistas, buscar os artistas
      const needArtistDetails = albumsData.some(album => 
        album.artist_id && typeof album.artist_id === 'string' && !album.artistName
      );
      
      if (needArtistDetails) {
        // Buscar todos os artistas para mapear IDs para nomes
        const artistsRes = await api.get('/artists');
        const artistsMap = {};
        
        // Criar um mapa de ID -> dados do artista
        artistsRes.data.forEach(artist => {
          artistsMap[artist._id] = artist;
        });
        
        // Adicionar nome do artista a cada álbum
        const enhancedAlbums = albumsData.map(album => {
          const artistId = album.artist_id || (album.artistId && album.artistId._id ? album.artistId._id : album.artistId);
          const artist = artistsMap[artistId];
          
          return {
            ...album,
            artistName: artist ? artist.name : 'Artista não informado'
          };
        });
        
        setAlbums(enhancedAlbums);
      } else {
        setAlbums(albumsData);
      }
    } catch (err) {
      console.error('Erro ao buscar álbuns:', err);
      if (err.response && err.response.status === 401) {
        setError('Não autorizado. Faça login novamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Erro ao carregar álbuns. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este álbum?')) {
      try {
        await api.delete(`/albums/${id}`);
        setAlbums((prev) => prev.filter((a) => a._id !== id));
        alert('Álbum excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir álbum:', err);
        if (err.response && err.response.status === 401) {
          setError('Não autorizado. Faça login novamente para excluir.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Erro ao excluir álbum. Verifique se há músicas associadas.');
        }
      }
    }
  };

  if (loading) return <p>Carregando álbuns...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Álbuns</h2>
      <Link to="/albums/new">Adicionar Novo Álbum</Link>
      {albums.length === 0 ? (
        <p>Nenhum álbum cadastrado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {albums.map((album) => {
            // Determinar o nome do artista usando o campo artistName que adicionamos
            // ou fazer fallback para o comportamento anterior
            const artistName = album.artistName || (
              (() => {
                const artistRef = album.artistId || album.artist || album.artist_id;
                return typeof artistRef === 'string'
                  ? 'Artista não informado'
                  : artistRef?.name || artistRef?.title || 'Artista não informado';
              })()
            );
            
            return (
              <li key={album._id || album.id} style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                <div>
                  <h3>{album.title}</h3>
                  <p>
                    <strong>Artista:</strong> {artistName}<br />
                    {album.year || album.release_date ? (
                      <><strong>Lançamento:</strong> {album.year || new Date(album.release_date).getFullYear()}</>
                    ) : null}
                  </p>
                  <div>
                    <Link 
                      to={`/albums/edit/${album._id || album.id}`} 
                      style={{ marginRight: '10px', padding: '5px 10px', background: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '3px' }}
                    >
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(album._id || album.id)} 
                      style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AlbumList;
