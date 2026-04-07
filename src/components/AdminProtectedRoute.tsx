import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { getCookie } from '@/lib/helpers';
import type { AdminProtectedRouteProps } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const adminToken = getCookie('admin-access-token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [adminToken, navigate]);

  if (isChecking) return <DashboardSkeleton />;

  return <>{children}</>;
};

export default AdminProtectedRoute;
