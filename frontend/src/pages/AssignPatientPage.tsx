import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import api from "../services/api";
import type { User } from "../types";

const AssignPatientPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["all-patients"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users/patients");
      return data;
    },
  });

  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (patientId: number) => {
      const { data } = await api.post("/patients/assign", { patientId });
      return data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Patient assigned",
        message: "Patient has been successfully assigned to you.",
        color: "teal",
      });
      setSelectedPatientId(null);
      // Invalidate queries to refresh patient lists
      queryClient.invalidateQueries({ queryKey: ["my-patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to assign patient";
      console.error("Assignment error:", error);
      notifications.show({
        title: "Assignment failed",
        message: errorMessage,
        color: "red",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedPatientId) return;
    mutation.mutate(Number(selectedPatientId));
  };

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Assign Patient</Title>
        <Text c="dimmed">
          Select a patient to add them to your care list. You'll be able to manage their medical information.
        </Text>
      </Stack>

      <Card radius="xl" padding="xl" withBorder>
        <Stack gap="md">
          <Select
            label="Select Patient"
            placeholder="Choose a patient"
            data={patients.map((p) => ({
              value: String(p.id),
              label: `${p.fullName} (${p.email})`,
            }))}
            searchable
            nothingFound="No patients found"
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            disabled={isLoading || mutation.isPending}
          />

          <Group justify="flex-end">
            <Button
              onClick={handleAssign}
              loading={mutation.isPending}
              disabled={!selectedPatientId}
              radius="xl"
            >
              Assign Patient
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};

export default AssignPatientPage;

