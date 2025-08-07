// frontend/src/pages/Login.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
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
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>Email: <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>Senha: <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <button 
                    type="submit" 
                    style={{ 
                        padding: '10px 15px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    Entrar
                </button>
            </form>
            {message && <p style={{ textAlign: 'center', marginTop: '15px', color: message.includes('sucedido') ? 'green' : 'red' }}>{message}</p>}
            <p style={{ textAlign: 'center', marginTop: '15px' }}>Não tem uma conta? <Link to="/register" style={{ color: '#4CAF50', textDecoration: 'none' }}>Registre-se aqui</Link></p>
        </div>
    );
};

export default Login;
