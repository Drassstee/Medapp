import { Avatar, Card, Grid, Stack, Text, Title } from "@mantine/core";

const testimonials = [
  {
    name: "Dr. Aigerim Suleimen",
    role: "Cardiologist, Almaty",
    quote:
      "MedApp allows me to manage clinic schedules and teleconsultations in one place. Patients love the quick onboarding.",
  },
  {
    name: "Nurzhan K.",
    role: "Patient, Astana",
    quote:
      "I can chat with my doctor, share lab results, and get AI guidance before every visit. It's a lifesaver for my family.",
  },
  {
    name: "Dana Bek",
    role: "Clinic Operations",
    quote:
      "Video tutorials and online bookings reduced our no-shows by 45%. MedApp team understands Kazakhstan's regulations.",
  },
];

const TestimonialsSection = () => (
  <Stack gap="xl" py={80} id="stories">
    <Title order={3} ta="center">
      Trusted by clinics, doctors, and families across Kazakhstan
    </Title>
    <Grid gutter="xl">
      {testimonials.map((item) => (
        <Grid.Col span={{ base: 12, md: 4 }} key={item.name}>
          <Card shadow="lg" padding="xl" radius="xl" withBorder>
            <Stack gap="md" align="center">
              <Avatar radius="xl" size="lg" color="blue">
                {item.name[0]}
              </Avatar>
              <Text size="sm" c="dimmed" ta="center">
                “{item.quote}”
              </Text>
              <Stack gap={0} align="center">
                <Text fw={600}>{item.name}</Text>
                <Text size="sm" c="dimmed">
                  {item.role}
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  </Stack>
);

export default TestimonialsSection;


