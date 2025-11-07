import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import api from "../../services/api";
import type { Appointment, User } from "../../types";

interface AppointmentSchedulerProps {
  doctors: User[];
}

interface FormValues {
  doctorId: string;
  scheduledAt: Date | null;
  durationMin: number;
  reason: string;
}

const AppointmentScheduler = ({ doctors }: AppointmentSchedulerProps) => {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    initialValues: {
      doctorId: "",
      scheduledAt: null,
      durationMin: 30,
      reason: "",
    },
    validate: {
      doctorId: (value) => (!value ? "Please choose a doctor" : null),
      scheduledAt: (value) => (!value ? "Select a date and time" : null),
      reason: (value) => (!value ? "Describe your concern" : null),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        doctorId: Number(values.doctorId),
        scheduledAt: values.scheduledAt?.toISOString(),
        durationMin: values.durationMin,
        reason: values.reason,
      };
      const { data } = await api.post<Appointment>("/appointments", payload);
      return data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Appointment requested",
        message: "We notified the doctor. You will receive confirmation soon.",
        color: "teal",
      });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      form.reset();
    },
    onError: () => {
      notifications.show({
        title: "Unable to create appointment",
        message: "Please verify the details and try again.",
        color: "red",
      });
    },
  });

  return (
    <Stack gap="md" component="form" onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Text fw={600}>Book a new appointment</Text>
      <Select
        label="Select doctor"
        placeholder="Choose a specialist"
        data={doctors.map((doctor) => ({ value: String(doctor.id), label: doctor.fullName }))}
        searchable
        nothingFound="No doctor"
        {...form.getInputProps("doctorId")}
      />
      <DateTimePicker
        label="Choose date & time"
        minDate={dayjs().toDate()}
        {...form.getInputProps("scheduledAt")}
      />
      <TextInput
        label="Duration (minutes)"
        type="number"
        min={15}
        max={120}
        {...form.getInputProps("durationMin")}
      />
      <Textarea
        label="Reason"
        placeholder="Describe symptoms or questions"
        minRows={3}
        {...form.getInputProps("reason")}
      />
      <Group justify="flex-end">
        <Button type="submit" loading={mutation.isPending}>
          Request appointment
        </Button>
      </Group>
    </Stack>
  );
};

export default AppointmentScheduler;


