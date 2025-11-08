import { Badge, Box, NavLink, Stack, Text } from "@mantine/core";
import {
  IconCalendarEvent,
  IconDashboard,
  IconPlayerPlay,
  IconStethoscope,
  IconUserPlus,
  IconFileText,
  IconDatabase,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const DashboardSidebar = () => {
  const location = useLocation();
  const { user } = useAuthContext();

  const links = [
    {
      label: "Overview",
      to: user?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient",
      icon: IconDashboard,
    },
    {
      label: "Appointments",
      to: "/dashboard/appointments",
      icon: IconCalendarEvent,
    },
    {
      label: "Videos",
      to: "/dashboard/videos",
      icon: IconPlayerPlay,
    },
  ];

  if (user?.role === "patient") {
    links.push({ label: "Our Doctors", to: "/dashboard/doctors", icon: IconStethoscope });
  }

  if (user?.role === "doctor") {
    links.push(
      { label: "Assign Patient", to: "/dashboard/patients/assign", icon: IconUserPlus },
      { label: "Patient Info", to: "/dashboard/patients/info", icon: IconFileText },
      { label: "Patient Database", to: "/dashboard/patients", icon: IconDatabase }
    );
  }

  return (
    <Box p="lg">
      <Stack gap="xs">
        <Box>
          <Text fw={600}>Dashboard</Text>
          <Badge variant="light" mt="xs" size="sm">
            {user?.role === "doctor" ? "Doctor" : user?.role === "patient" ? "Patient" : "Admin"}
          </Badge>
        </Box>
        {links.map((link) => (
          <NavLink
            key={link.to}
            label={link.label}
            component={Link}
            to={link.to}
            active={location.pathname === link.to}
            leftSection={<link.icon size={18} />}
            radius="md"
            variant="light"
          />
        ))}
      </Stack>
    </Box>
  );
};

export default DashboardSidebar;


