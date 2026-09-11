/**
 * ============================================================================
 * File: ProtectedRoute.tsx
 * Path: Frontend/src/components/ProtectedRoute.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Protects authenticated Knected routes from unauthenticated access.
 *
 * Responsibilities:
 * - Check whether a JWT token exists
 * - Redirect unauthenticated users to the login page
 * - Render protected pages when a token is available
 * ============================================================================
 */

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // No token means the user is not logged in.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists, so render the requested protected page.
  return <Outlet />;
};

export default ProtectedRoute;