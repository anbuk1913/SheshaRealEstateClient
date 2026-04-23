import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

export const ProtectedRoute = () => {
  const { token } = useSelector((s: RootState) => s.auth);
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
