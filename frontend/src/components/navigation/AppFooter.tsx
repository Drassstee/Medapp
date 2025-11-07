import { Anchor, Container, Divider, Group, Stack, Text } from "@mantine/core";

const AppFooter = () => (
  <Container size="lg" py="xl">
    <Stack gap="sm">
      <Divider color="gray.2" />
      <Group justify="space-between" align="center" wrap="wrap">
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} MedApp. Bridging doctors and patients across Kazakhstan.
        </Text>
        <Group gap="md">
          <Anchor href="#about" size="sm" c="dimmed">
            About
          </Anchor>
          <Anchor href="#contact" size="sm" c="dimmed">
            Contact
          </Anchor>
          <Anchor href="#privacy" size="sm" c="dimmed">
            Privacy
          </Anchor>
        </Group>
      </Group>
    </Stack>
  </Container>
);

export default AppFooter;


