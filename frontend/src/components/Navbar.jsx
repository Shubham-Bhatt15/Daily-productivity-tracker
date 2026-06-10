import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">TaskFlow</Link>
      {user && (
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/tasks">Tasks</Link>
          <span className="nav-user">{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;