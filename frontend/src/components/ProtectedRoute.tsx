import { Loader, Stack, Text } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import type { Role } from "../types";

interface ProtectedRouteProps {
  roles?: Role[];
  redirectTo?: string;
}

const ProtectedRoute = ({ roles, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Loader />
        <Text size="sm" c="dimmed">
          Preparing your workspace...
        </Text>
      </Stack>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


