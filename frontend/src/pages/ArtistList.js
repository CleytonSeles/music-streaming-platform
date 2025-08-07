// frontend/src/pages/ArtistList.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const ArtistList = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await api.get('/artists');
                setArtists(response.data);
            } catch (err) {
                console.error('Erro ao buscar artistas:', err);
                if (err.response && err.response.status === 401) {
                    setError('Não autorizado. Por favor, faça login novamente.');
                    localStorage.removeItem('token'); // Limpa o token inválido
                    setTimeout(() => navigate('/login'), 2000); // Redireciona para login
                } else {
                    setError('Erro ao carregar artistas. Tente novamente mais tarde.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este artista?')) {
            try {
                await api.delete(`/artists/${id}`);
                setArtists(artists.filter(artist => artist._id !== id));
                alert('Artista excluído com sucesso!');
            } catch (err) {
                console.error('Erro ao excluir artista:', err);
                if (err.response && err.response.status === 401) {
                    setError('Não autorizado. Por favor, faça login novamente para excluir.');
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError('Erro ao excluir artista. Verifique se há álbuns ou músicas associados.');
                }
            }
        }
    };

    if (loading) return <p>Carregando artistas...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Artistas</h2>
            <Link to="/artists/new">Adicionar Novo Artista</Link>
            {artists.length === 0 ? (
                <p>Nenhum artista cadastrado ainda.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {artists.map(artist => (
                        <li key={artist._id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                {artist.image_url && (
                                    <img 
                                        src={artist.image_url} 
                                        alt={artist.name} 
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '15px' }} 
                                    />
                                )}
                                <div>
                                    <h3>{artist.name}</h3>
                                    {artist.bio && <p>{artist.bio}</p>}
                                    <div>
                                        <Link to={`/artists/edit/${artist._id}`} style={{ marginRight: '10px' }}>Editar</Link>
                                        <button 
                                            onClick={() => handleDelete(artist._id)} 
                                            style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ArtistList;
