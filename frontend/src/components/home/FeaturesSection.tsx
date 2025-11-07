import { Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import {
  IconCloudUpload,
  IconHeartbeat,
  IconMessages,
  IconReportMedical,
} from "@tabler/icons-react";

const features = [
  {
    title: "Telemedicine without friction",
    description: "Book appointments, conduct video visits, and share diagnostic reports instantly.",
    icon: IconReportMedical,
  },
  {
    title: "AI symptom triage",
    description:
      "Guide patients to the right doctor or self-care plan using our integrated ML predictions.",
    icon: IconHeartbeat,
  },
  {
    title: "Video education library",
    description: "Empower communities with doctor-approved wellness videos and live webinars.",
    icon: IconCloudUpload,
  },
  {
    title: "Secure messaging",
    description:
      "HIPAA-grade encrypted messaging between patients, doctors, and care teams across clinics.",
    icon: IconMessages,
  },
];

const FeaturesSection = () => (
  <Stack gap="xl" py={60} id="features">
    <Stack gap="xs" align="center">
      <Title order={2}>One platform. Complete digital health.</Title>
      <Text maw={600} ta="center" c="dimmed">
        MedApp upgrades Kazakhstan's clinics with a modern patient experience — from education to
        follow-up — while keeping doctors in control.
      </Text>
    </Stack>
    <Grid gutter="xl">
      {features.map((feature) => (
        <Grid.Col span={{ base: 12, md: 6 }} key={feature.title}>
          <Card shadow="md" radius="xl" padding="xl" withBorder>
            <Group align="flex-start" gap="lg">
              <feature.icon size={36} />
              <Stack gap="xs">
                <Text fw={600} size="lg">
                  {feature.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  </Stack>
);

export default FeaturesSection;


