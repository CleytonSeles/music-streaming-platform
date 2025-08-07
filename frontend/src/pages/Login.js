// frontend/src/pages/Login.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token); // Armazena o token JWT
            setMessage('Login bem-sucedido! Redirecionando...');
            setTimeout(() => {
                navigate('/'); // Redireciona para a página inicial após o login
            }, 1500);
        } catch (err) {
            console.error('Erro de login:', err.response ? err.response.data : err.message);
            setMessage(err.response ? err.response.data.message : 'Erro ao fazer login.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
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
                <button type="submit">Entrar</button>
            </form>
            {message && <p>{message}</p>}
            <p>Não tem uma conta? <a href="/register">Registre-se aqui</a></p>
        </div>
    );
};

export default Login;
