// components/PrivateRoute.tsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/AuthContext';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
