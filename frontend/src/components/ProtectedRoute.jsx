import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log('5. ProtectedRoute — loading:', loading, '| user:', user);
  if (loading) return <div className="loader">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};
export default ProtectedRoute;