import { Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { IconCalendarEvent, IconPlayerPlay, IconUsers } from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { useVideos } from "../hooks/useVideos";
import { useAppointments } from "../hooks/useAppointments";
import UploadVideoForm from "../components/video/UploadVideoForm";
import AppointmentList from "../components/appointments/AppointmentList";

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: { size?: number }) => JSX.Element;
  label: string;
  value: string | number;
}) => (
  <Card radius="xl" padding="lg" withBorder>
    <Group>
      <Icon size={32} />
      <Stack gap={0}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text fw={700} size="xl">
          {value}
        </Text>
      </Stack>
    </Group>
  </Card>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { data: videos = [] } = useVideos();
  const { data: appointments = [], isLoading } = useAppointments();

  const totalPatients = new Set(appointments.map((appt) => appt.patient?.id)).size;

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Hello, Dr. {user?.fullName}</Title>
        <Text c="dimmed">
          Manage your digital clinic, share expertise, and keep patients engaged.
        </Text>
      </Stack>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard icon={IconPlayerPlay} label="Public videos" value={videos.length} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard icon={IconCalendarEvent} label="Upcoming appointments" value={appointments.filter((appt) => appt.status !== "completed" && appt.status !== "cancelled").length} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard icon={IconUsers} label="Unique patients" value={totalPatients || 0} />
        </Grid.Col>
      </Grid>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <UploadVideoForm />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card radius="xl" padding="xl" withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={600}>Upcoming appointments</Text>
              </Group>
              <AppointmentList appointments={appointments} isLoading={isLoading} emptyLabel="No appointments yet" />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default DoctorDashboard;


