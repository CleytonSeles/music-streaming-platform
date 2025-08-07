// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ArtistList from './pages/ArtistList'; // Importa o componente de lista de artistas
import ArtistForm from './pages/ArtistForm'; // Importa o componente de formulário de artistas

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    return token ? children : null; // Renderiza os filhos se houver token, senão, redireciona
};

const Home = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove o token
        navigate('/login'); // Redireciona para o login
    };

    return (
        <div>
            <h1>Bem-vindo!</h1>
            <p>Você está logado. Esta é a página inicial.</p>
            <button onClick={handleLogout}>Sair</button>
            <nav>
                <ul>
                    <li><Link to="/artists">Gerenciar Artistas</Link></li>
                    <li><Link to="/albums">Gerenciar Álbuns (em breve)</Link></li>
                    <li><Link to="/songs">Gerenciar Músicas (em breve)</Link></li>
                </ul>
            </nav>
        </div>
    );
};

function App() {
    return (
        <Router>
            <div className="App">
                <header>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/register">Registrar</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        {/* Rotas Protegidas */}
                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/artists" element={<PrivateRoute><ArtistList /></PrivateRoute>} />
                        <Route path="/artists/new" element={<PrivateRoute><ArtistForm /></PrivateRoute>} />
                        <Route path="/artists/edit/:id" element={<PrivateRoute><ArtistForm /></PrivateRoute>} />
                        {/* Placeholders para álbuns e músicas, que também serão protegidos */}
                        <Route path="/albums" element={<PrivateRoute><div>Página de Álbuns (em breve)</div></PrivateRoute>} />
                        <Route path="/songs" element={<PrivateRoute><div>Página de Músicas (em breve)</div></PrivateRoute>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
