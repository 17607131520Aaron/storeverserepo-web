import React, { type ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import useAuth from "@/hooks/useAuth";

interface IRequireAuthProps {
  children: ReactNode;
}

const RequireAuth: React.FC<IRequireAuthProps> = ({ children }) => {
  const { isAuthenticated, tokenExpired, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || tokenExpired) {
    if (tokenExpired) {
      void logout();
    }
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
};

export default RequireAuth;
