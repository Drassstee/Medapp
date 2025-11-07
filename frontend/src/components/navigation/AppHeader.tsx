import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Text,
  rem,
} from "@mantine/core";
import { IconHeartbeat } from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useMemo } from "react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Video Library", to: "/videos" },
  { label: "About", to: "#about" },
  { label: "Contact", to: "#contact" },
];

interface AppHeaderProps {
  variant?: "default" | "dashboard";
}

const AppHeader = ({ variant = "default" }: AppHeaderProps) => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPath = useMemo(() => {
    if (!user) return "/login";
    return user.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
  }, [user]);

  const showAuthButtons = variant === "default";

  return (
    <Box
      component="header"
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
      })}
    >
      <Container size="lg" py="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs" component={NavLink} to="/" style={{ textDecoration: "none" }}>
            <ActionIcon
              variant="gradient"
              size="xl"
              radius="lg"
              gradient={{ from: "blue", to: "teal" }}
            >
              <IconHeartbeat size={20} />
            </ActionIcon>
            <Text fw={700} size="lg">
              MedApp
            </Text>
          </Group>

          {variant === "default" && (
            <Group gap="md" visibleFrom="md">
              {navLinks.map((link) => (
                <Text
                  key={link.to}
                  component={link.to.startsWith("#") ? "a" : NavLink}
                  to={link.to.startsWith("#") ? undefined : link.to}
                  href={link.to.startsWith("#") ? link.to : undefined}
                  fw={location.pathname === link.to ? 600 : 500}
                  c={location.pathname === link.to ? "blue.6" : "gray.7"}
                  style={{ textDecoration: "none" }}
                >
                  {link.label}
                </Text>
              ))}
            </Group>
          )}

          <Group gap="sm">
            {user ? (
              <>
                <Button variant="subtle" onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </Button>
                <Button variant="light" color="red" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              showAuthButtons && (
                <>
                  <Button variant="subtle" onClick={() => navigate("/login")}>
                    Sign in
                  </Button>
                  <Button
                    radius="xl"
                    size="md"
                    style={{ paddingInline: rem(22) }}
                    onClick={() => navigate("/register")}
                  >
                    Join MedApp
                  </Button>
                </>
              )
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default AppHeader;


