import { useState } from "react";
import {
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from "../hooks/useAuth";

type RoleOption = "doctor" | "patient";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  speciality?: string;
  experienceYears?: number;
  licenseNumber?: string;
  bio?: string;
  clinicName?: string;
  city?: string;
  gender?: string;
  chronicConditions?: string;
}

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const [role, setRole] = useState<RoleOption>("patient");

  const form = useForm<RegisterForm>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      speciality: "",
      experienceYears: 3,
      licenseNumber: "",
      clinicName: "",
      city: "",
      bio: "",
      gender: "",
      chronicConditions: "",
    },
    validate: {
      fullName: (value) => (!value ? "Full name is required" : null),
      email: (value) => (!/\S+@\S+\.\S+/.test(value) ? "Invalid email" : null),
      password: (value) => (value.length < 6 ? "Use at least 6 characters" : null),
      speciality: (value) => (role === "doctor" && !value ? "Speciality required" : null),
      licenseNumber: (value) => (role === "doctor" && !value ? "License number required" : null),
    },
  });

  const handleSubmit = async (values: RegisterForm) => {
    const payload: any = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phone: values.phone,
      role,
    };

    if (role === "doctor") {
      payload.doctorProfile = {
        speciality: values.speciality,
        experienceYears: values.experienceYears,
        licenseNumber: values.licenseNumber,
        bio: values.bio,
        clinicName: values.clinicName,
        city: values.city,
      };
    } else {
      payload.patientProfile = {
        gender: values.gender,
        chronicConditions: values.chronicConditions,
      };
    }

    await register(payload);
  };

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Create your MedApp account</Title>
        <Text c="dimmed" size="sm">
          Join thousands of doctors and patients building modern healthcare journeys.
        </Text>
      </Stack>

      <SegmentedControl
        value={role}
        onChange={(value: RoleOption) => setRole(value)}
        data={[{ label: "Patient", value: "patient" }, { label: "Doctor", value: "doctor" }]}
        fullWidth
        radius="xl"
        size="md"
      />

      <Stack gap="md" component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Full name" required {...form.getInputProps("fullName")} />
        <Group grow>
          <TextInput label="Email" required {...form.getInputProps("email")} />
          <TextInput label="Phone" {...form.getInputProps("phone")} />
        </Group>
        <TextInput label="Password" type="password" required {...form.getInputProps("password")} />

        {role === "doctor" ? (
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Speciality" required {...form.getInputProps("speciality")} />
              <NumberInput
                label="Experience (years)"
                min={1}
                max={50}
                {...form.getInputProps("experienceYears")}
              />
            </Group>
            <Group grow>
              <TextInput label="License number" required {...form.getInputProps("licenseNumber")} />
              <TextInput label="Clinic name" {...form.getInputProps("clinicName")} />
            </Group>
            <TextInput label="City" {...form.getInputProps("city")} />
            <Textarea label="Short bio" minRows={3} {...form.getInputProps("bio")} />
          </Stack>
        ) : (
          <Stack gap="sm">
            <TextInput label="Gender" {...form.getInputProps("gender")} />
            <Textarea
              label="Chronic conditions"
              placeholder="E.g. Diabetes, Hypertension"
              minRows={2}
              {...form.getInputProps("chronicConditions")}
            />
          </Stack>
        )}

        <Button type="submit" loading={isLoading} radius="xl">
          Create account
        </Button>
      </Stack>
    </Stack>
  );
};

export default RegisterPage;


