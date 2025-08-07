// frontend/src/pages/Register.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, password });
            setMessage('Registro bem-sucedido! Redirecionando para o login...');
            setTimeout(() => {
                navigate('/login'); // Redireciona para a página de login após o registro
            }, 2000);
        } catch (err) {
            console.error('Erro de registro:', err.response ? err.response.data : err.message);
            setMessage(err.response ? err.response.data.message : 'Erro ao registrar.');
        }
    };

    return (
        <div>
            <h2>Registrar</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Usuário:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
            {message && <p>{message}</p>}
            <p>Já tem uma conta? <a href="/login">Faça login aqui</a></p>
        </div>
    );
};

export default Register;
