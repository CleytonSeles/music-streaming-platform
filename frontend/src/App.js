// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ArtistList from './pages/ArtistList';
import ArtistForm from './pages/ArtistForm';
import AlbumList from './pages/AlbumList';
import AlbumForm from './pages/AlbumForm';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  return token ? children : null;
};

const Home = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Bem-vindo!</h1>
      <p>Você está logado. Esta é a página inicial.</p>
      <button onClick={handleLogout}>Sair</button>
      <nav>
        <ul>
          <li><Link to="/artists">Gerenciar Artistas</Link></li>
          <li><Link to="/albums">Gerenciar Álbuns</Link></li>
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
            {/* Rotas protegidas */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            {/* Artistas */}
            <Route path="/artists" element={<PrivateRoute><ArtistList /></PrivateRoute>} />
            <Route path="/artists/new" element={<PrivateRoute><ArtistForm /></PrivateRoute>} />
            <Route path="/artists/edit/:id" element={<PrivateRoute><ArtistForm /></PrivateRoute>} />
            {/* Álbuns */}
            <Route path="/albums" element={<PrivateRoute><AlbumList /></PrivateRoute>} />
            <Route path="/albums/new" element={<PrivateRoute><AlbumForm /></PrivateRoute>} />
            <Route path="/albums/edit/:id" element={<PrivateRoute><AlbumForm /></PrivateRoute>} />
            {/* Músicas (em breve) */}
            <Route path="/songs" element={<PrivateRoute><div>Página de Músicas (em breve)</div></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
