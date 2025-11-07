import {
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconShieldCheck, IconStethoscope, IconUsersGroup } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box py={80} id="about">
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Badge size="lg" radius="xl" variant="light" color="blue">
            AI-assisted healthcare platform
          </Badge>
          <Stack gap="md" mt="lg">
            <Text fw={700} size={40} lh={1.1}>
              MedApp connects Kazakh doctors and patients with confidence
            </Text>
            <Text size="lg" c="dimmed">
              Secure appointments, instant video education, and AI-driven triage — all in one
              beautiful experience for clinics and families.
            </Text>
            <Group gap="md">
              <Button size="lg" radius="xl" onClick={() => navigate("/register")}
                >
                Create free account
              </Button>
              <Button
                size="lg"
                variant="outline"
                radius="xl"
                onClick={() => navigate("/videos")}
              >
                Explore videos
              </Button>
            </Group>
            <Group gap="xl" mt="lg">
              <FeatureIcon icon={IconStethoscope} label="Certified doctors" />
              <FeatureIcon icon={IconUsersGroup} label="Patient-first design" />
              <FeatureIcon icon={IconShieldCheck} label="HIPAA-grade security" />
            </Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box
            p="lg"
            radius="xl"
            bg="linear-gradient(135deg, rgba(56, 116, 255, 0.12), rgba(15, 205, 203, 0.12))"
            sx={{
              border: "1px solid rgba(56, 116, 255, 0.2)",
              boxShadow: "0 30px 60px rgba(15, 99, 203, 0.15)",
            }}
          >
            <Stack gap="sm">
              <Text fw={600}>24/7 Digital Care</Text>
              <Text size="sm" c="dimmed">
                Schedule telemedicine appointments, share health records, and receive AI-assisted
                guidance wherever you are in Kazakhstan.
              </Text>
              <Box
                py="md"
                px="lg"
                radius="xl"
                bg="white"
                sx={{ border: "1px solid rgba(56, 116, 255, 0.15)" }}
              >
                <Stack gap="xs">
                  <Text fw={600}>Why MedApp works</Text>
                  <Text size="sm" c="dimmed">
                    • Verified medical professionals across specialties
                  </Text>
                  <Text size="sm" c="dimmed">
                    • Secure messaging, video calls, and prescription tracking
                  </Text>
                  <Text size="sm" c="dimmed">
                    • AI triage to prioritize urgent care and recommendations
                  </Text>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

const FeatureIcon = ({
  icon: Icon,
  label,
}: {
  icon: (props: { size?: number }) => JSX.Element;
  label: string;
}) => (
  <Group gap="xs">
    <ThemeIcon radius="xl" variant="light" size="lg" color="blue">
      <Icon size={18} />
    </ThemeIcon>
    <Text size="sm" fw={500} c="gray.6">
      {label}
    </Text>
  </Group>
);

export default HeroSection;


