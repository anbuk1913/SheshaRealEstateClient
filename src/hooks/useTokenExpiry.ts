import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export const useTokenExpiry = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) return;

      try {
        // Decode JWT payload without verification (since we only need the exp claim)
        const parts = token.split('.');
        if (parts.length !== 3) return;

        const decoded = JSON.parse(atob(parts[1]));
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry > 0) {
          // Set timeout to remove token when it expires
          const timeoutId = setTimeout(() => {
            dispatch(logout());
            window.location.href = '/admin';
          }, timeUntilExpiry);

          return () => clearTimeout(timeoutId);
        } else {
          // Token is already expired
          dispatch(logout());
          window.location.href = '/admin';
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    checkTokenExpiry();
  }, [dispatch]);
};
