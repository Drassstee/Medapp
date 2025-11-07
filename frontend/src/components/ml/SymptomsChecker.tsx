import { useMutation } from "@tanstack/react-query";
import { Button, Checkbox, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import api from "../../services/api";
import type { SymptomsPrediction } from "../../types";

interface SymptomsForm {
  fever: boolean;
  cough: boolean;
  headache: boolean;
}

const SymptomsChecker = () => {
  const form = useForm<SymptomsForm>({ initialValues: { fever: false, cough: false, headache: false } });

  const mutation = useMutation({
    mutationFn: async (values: SymptomsForm) => {
      const { data } = await api.post<SymptomsPrediction>("/ml/symptoms", values);
      return data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: `Assessment: ${data.prediction}`,
        message: `Confidence: ${(data.confidence * 100).toFixed(0)}%`,
        color: data.prediction.includes("Likely") ? "red" : "teal",
      });
    },
    onError: () => {
      notifications.show({
        title: "Prediction failed",
        message: "Please try again later",
        color: "red",
      });
    },
  });

  return (
    <Paper withBorder radius="xl" p="xl">
      <Stack gap="md">
        <Title order={4}>AI Symptoms Check</Title>
        <Text size="sm" c="dimmed">
          Quick pre-triage helps prioritize urgent cases for doctors.
        </Text>
        <Checkbox label="Fever" {...form.getInputProps("fever", { type: "checkbox" })} />
        <Checkbox label="Cough" {...form.getInputProps("cough", { type: "checkbox" })} />
        <Checkbox label="Headache" {...form.getInputProps("headache", { type: "checkbox" })} />
        <Group justify="flex-end">
          <Button onClick={() => mutation.mutate(form.values)} loading={mutation.isPending}>
            Run assessment
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default SymptomsChecker;


