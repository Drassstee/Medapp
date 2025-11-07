import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import AppHeader from "../navigation/AppHeader";
import AppFooter from "../navigation/AppFooter";

const MainLayout = () => (
  <AppShell
    padding="xl"
    header={{ height: 72 }}
    footer={{ height: 80 }}
    withBorder={false}
    styles={{ main: { paddingTop: 40, paddingBottom: 40 } }}
  >
    <AppShell.Header>
      <AppHeader />
    </AppShell.Header>
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
    <AppShell.Footer>
      <AppFooter />
    </AppShell.Footer>
  </AppShell>
);

export default MainLayout;


