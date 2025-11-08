import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Checkbox,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useForm } from "@mantine/form";
import React from "react";
import api from "../services/api";
import type { Disease, Patient } from "../hooks/usePatients";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const AGE_GROUP_OPTIONS = [
  { value: "0-18", label: "0-18 years" },
  { value: "19-35", label: "19-35 years" },
  { value: "36-50", label: "36-50 years" },
  { value: "51-65", label: "51-65 years" },
  { value: "65+", label: "65+ years" },
];

const PatientInfoPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patients = [], isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ["patients", "my"],
    queryFn: async () => {
      const { data } = await api.get<Patient[]>("/patients", { params: { filter: "my" } });
      return data;
    },
  });

  const { data: diseases = [], isLoading: diseasesLoading } = useQuery({
    queryKey: ["diseases"],
    queryFn: async () => {
      const { data } = await api.get<Disease[]>("/patients/diseases");
      return data;
    },
  });

  const form = useForm({
    initialValues: {
      gender: "",
      ageGroup: "",
      diseaseIds: [] as string[],
    },
    validate: {
      gender: (value) => (!value ? "Gender is required" : null),
      ageGroup: (value) => (!value ? "Age group is required" : null),
    },
    transformValues: (values) => ({
      ...values,
      diseaseIds: Array.isArray(values.diseaseIds) ? values.diseaseIds : [],
    }),
  });

  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (values: { gender: string; ageGroup: string; diseaseIds: number[] }) => {
      const { data } = await api.post(`/patients/${selectedPatientId}/medical-info`, values);
      return data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Information saved",
        message: "Patient medical information has been updated successfully.",
        color: "teal",
      });
      form.reset();
      setSelectedPatientId(null);
      // Refresh patient list to show updated medical info
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Save failed",
        message: error?.response?.data?.error || "Failed to save information",
        color: "red",
      });
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (!selectedPatientId) {
      notifications.show({
        title: "Patient required",
        message: "Please select a patient first",
        color: "yellow",
      });
      return;
    }
    mutation.mutate({
      gender: values.gender,
      ageGroup: values.ageGroup,
      diseaseIds: values.diseaseIds.map(Number),
    });
  });

  const selectedPatient = patients.find((p) => String(p.id) === selectedPatientId);
  
  // Prepare disease options - ensure all items are valid
  const diseaseOptions = React.useMemo(() => {
    if (!diseases || !Array.isArray(diseases)) return [];
    return diseases
      .filter((d) => d && d.id && d.name)
      .map((d) => ({
        value: String(d.id),
        label: `${d.name}${d.category ? ` (${d.category})` : ""}`,
      }));
  }, [diseases]);

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Patient Medical Information</Title>
        <Text c="dimmed">
          Fill out medical information for your assigned patients. This data will be available to all doctors.
        </Text>
      </Stack>

      <Card radius="xl" padding="xl" withBorder>
        <Stack gap="md" component="form" onSubmit={handleSubmit}>
          {patientsError && (
            <Text c="red" size="sm">
              Failed to load patients. Please try refreshing the page.
            </Text>
          )}
          <Select
            label="Select Patient"
            placeholder={patientsLoading ? "Loading patients..." : "Choose a patient from your list"}
            data={patients.map((p) => ({
              value: String(p.id),
              label: `${p.fullName} (${p.email})`,
            }))}
            searchable
            nothingFound={patientsLoading ? "Loading..." : "No patients assigned to you"}
            value={selectedPatientId}
            onChange={(value) => {
              setSelectedPatientId(value);
              const patient = patients.find((p) => String(p.id) === value);
              if (value && patient?.medicalInfo) {
                form.setValues({
                  gender: patient.medicalInfo.gender,
                  ageGroup: patient.medicalInfo.ageGroup,
                  diseaseIds: patient.medicalInfo.diseases.map((d) => String(d.id)),
                });
              } else {
                form.reset();
              }
            }}
            disabled={patientsLoading || mutation.isPending}
          />
          {!patientsLoading && patients.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="md">
              No patients assigned to you yet. Go to "Assign Patient" to add patients to your list.
            </Text>
          )}

          {selectedPatientId && (
            <>
              <Select
                label="Gender"
                placeholder="Select gender"
                data={GENDER_OPTIONS}
                required
                {...form.getInputProps("gender")}
              />

              <Select
                label="Age Group"
                placeholder="Select age group"
                data={AGE_GROUP_OPTIONS}
                required
                {...form.getInputProps("ageGroup")}
              />

              {diseasesLoading ? (
                <Text c="dimmed" size="sm">Loading diseases...</Text>
              ) : (
                <MultiSelect
                  label="Diseases"
                  placeholder="Select diseases (multiple allowed)"
                  data={diseaseOptions}
                  value={Array.isArray(form.values.diseaseIds) ? form.values.diseaseIds : []}
                  onChange={(value) => form.setFieldValue("diseaseIds", Array.isArray(value) ? value : [])}
                  searchable
                  clearable
                  nothingFound="No diseases found"
                />
              )}

              <Group justify="flex-end">
                <Button type="submit" loading={mutation.isPending} radius="xl">
                  Save Information
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default PatientInfoPage;

