import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router-dom";
import AppHeader from "../navigation/AppHeader";
import DashboardSidebar from "../navigation/DashboardSidebar";

const DashboardLayout = () => (
  <AppShell
    header={{ height: 72 }}
    navbar={{ width: 260, breakpoint: "md" }}
    padding="md"
    withBorder={false}
  >
    <AppShell.Header>
      <AppHeader variant="dashboard" />
    </AppShell.Header>
    <AppShell.Navbar>
      <DashboardSidebar />
    </AppShell.Navbar>
    <AppShell.Main>
      <Container size="xl" py="xl">
        <Outlet />
      </Container>
    </AppShell.Main>
  </AppShell>
);

export default DashboardLayout;


