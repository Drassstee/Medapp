import { Card, Grid, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentScheduler from "../components/appointments/AppointmentScheduler";
import SymptomsChecker from "../components/ml/SymptomsChecker";
import VideoGrid from "../components/video/VideoGrid";
import { useVideos } from "../hooks/useVideos";

const PatientDashboard = () => {
  const { user } = useAuth();
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const { data: videos = [], isLoading: videosLoading } = useVideos();

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Welcome, {user?.fullName}</Title>
        <Text c="dimmed">Stay on top of your health journey and connect with experts instantly.</Text>
      </Stack>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card radius="xl" padding="xl" withBorder>
            <AppointmentScheduler doctors={doctors} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SymptomsChecker />
        </Grid.Col>
      </Grid>

      <Card radius="xl" padding="xl" withBorder>
        <Stack gap="md">
          <Text fw={600}>Your upcoming appointments</Text>
          <AppointmentList
            appointments={appointments}
            isLoading={appointmentsLoading}
            emptyLabel="No appointments scheduled. Book your visit above."
          />
        </Stack>
      </Card>

      <Stack gap="md">
        <Text fw={600} size="lg">
          Recommended videos
        </Text>
        <VideoGrid videos={videos.slice(0, 3)} isLoading={videosLoading} emptyLabel="No videos yet." />
      </Stack>
    </Stack>
  );
};

export default PatientDashboard;


