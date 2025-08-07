// frontend/src/pages/ArtistForm.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const ArtistForm = () => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); // Pega o ID da URL se estiver em modo de edição

    useEffect(() => {
        if (id) { // Se houver um ID, estamos editando
            const fetchArtist = async () => {
                try {
                    const response = await api.get(`/artists/${id}`);
                    setName(response.data.name);
                    setBio(response.data.bio || '');
                    setImageUrl(response.data.image_url || '');
                } catch (err) {
                    console.error('Erro ao buscar artista para edição:', err);
                    if (err.response && err.response.status === 401) {
                        setError('Não autorizado. Por favor, faça login novamente.');
                        localStorage.removeItem('token');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError('Erro ao carregar dados do artista para edição.');
                    }
                }
            };
            fetchArtist();
        }
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError(null);

        try {
            if (id) { // Modo de edição
                await api.put(`/artists/${id}`, { name, bio, image_url: imageUrl });
                setMessage('Artista atualizado com sucesso!');
            } else { // Modo de criação
                await api.post('/artists', { name, bio, image_url: imageUrl });
                setMessage('Artista adicionado com sucesso!');
            }
            setTimeout(() => {
                navigate('/artists'); // Redireciona para a lista de artistas
            }, 1500);
        } catch (err) {
            console.error('Erro ao salvar artista:', err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                setError('Não autorizado. Por favor, faça login novamente.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.response ? err.response.data.message : 'Erro ao salvar artista.');
            }
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>{id ? 'Editar Artista' : 'Adicionar Novo Artista'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome do Artista:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Biografia:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="4"
                    />
                </div>
                <div>
                    <label>URL da Imagem:</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="http://exemplo.com/imagem.jpg"
                    />
                </div>
                <button type="submit">Salvar Artista</button>
            </form>
            {message && <p>{message}</p>}
            <p><Link to="/artists">Voltar para a lista de artistas</Link></p>
        </div>
    );
};

export default ArtistForm;
