import { getCurrentUser } from '@/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie, setCookie } from '@/lib/helpers';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const activeRole = getCookie('x-active-role');
  const accessToken = getCookie('access-token');
  const refreshToken = getCookie('refresh-token');
  const navigate = useNavigate();
  const isAuthenticated = !!accessToken && !!refreshToken && !!activeRole;

  const getUser = useCallback(async () => {
    setIsLoading(true);
    const { data } = await getCurrentUser();
    setUser(data);
    setCookie('auth-user', JSON.stringify(data));
    setIsLoading(false);
  }, [setUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    if (!user && accessToken && refreshToken && activeRole) {
      void getUser();
    }
  }, [
    isAuthenticated,
    navigate,
    getUser,
    user,
    accessToken,
    refreshToken,
    activeRole,
  ]);

  return (
    <>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        children
      )}
    </>
  );
};

export default ProtectedRoute;
