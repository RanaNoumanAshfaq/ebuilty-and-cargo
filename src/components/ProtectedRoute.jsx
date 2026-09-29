import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-[#00F5D4]" size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // If user doesn't have the correct role for this route, redirect to their own portal dashboard
    const ownDashboard = 
      userData.role === 'admin' ? '/admin' :
      userData.role === 'truck_owner' ? '/truck-owner' :
      userData.role === 'transporter' ? '/transporter' :
      userData.role === 'business' ? '/business' : '/';
    return <Navigate to={ownDashboard} replace />;
  }

  return children;
}
