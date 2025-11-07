import { Box, Container, Paper } from "@mantine/core";
import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <Container size={480} py="5rem">
    <Paper shadow="lg" radius="xl" p="xl" withBorder>
      <Box>
        <Outlet />
      </Box>
    </Paper>
  </Container>
);

export default AuthLayout;


