// frontend/src/pages/Register.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, email, password });
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
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Registrar</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>Usuário: <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
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
                    Registrar
                </button>
            </form>
            {message && <p style={{ textAlign: 'center', marginTop: '15px', color: message.includes('sucedido') ? 'green' : 'red' }}>{message}</p>}
            <p style={{ textAlign: 'center', marginTop: '15px' }}>Já tem uma conta? <Link to="/login" style={{ color: '#4CAF50', textDecoration: 'none' }}>Faça login aqui</Link></p>
        </div>
    );
};

export default Register;
