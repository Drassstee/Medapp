import { Badge, Card, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import type { Appointment } from "../../types";
import dayjs from "dayjs";

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  emptyLabel?: string;
}

const statusColors: Record<Appointment["status"], string> = {
  pending: "yellow",
  confirmed: "blue",
  completed: "teal",
  cancelled: "red",
};

const AppointmentList = ({ appointments, isLoading, emptyLabel = "No appointments" }: AppointmentListProps) => {
  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid.Col span={{ base: 12, md: 6 }} key={index}>
            <Skeleton height={160} radius="lg" />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (!appointments.length) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed">{emptyLabel}</Text>
      </Stack>
    );
  }

  return (
    <Grid>
      {appointments.map((appointment) => (
        <Grid.Col span={{ base: 12, md: 6 }} key={appointment.id}>
          <Card radius="xl" padding="lg" withBorder>
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text fw={600}>{dayjs(appointment.scheduledAt).format("MMMM D, YYYY HH:mm")}</Text>
                <Badge color={statusColors[appointment.status]} variant="light">
                  {appointment.status.toUpperCase()}
                </Badge>
              </Group>
              {appointment.doctor && (
                <Text size="sm" c="dimmed">
                  Doctor: {appointment.doctor.fullName}
                </Text>
              )}
              {appointment.patient && (
                <Text size="sm" c="dimmed">
                  Patient: {appointment.patient.fullName}
                </Text>
              )}
              {appointment.reason && (
                <Text size="sm">Reason: {appointment.reason}</Text>
              )}
              {appointment.notes && (
                <Text size="sm" c="dimmed">
                  Notes: {appointment.notes}
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default AppointmentList;


