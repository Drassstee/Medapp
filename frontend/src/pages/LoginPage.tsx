import { useState } from "react";
import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (!/\S+@\S+\.\S+/.test(value) ? "Enter a valid email" : null),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      await login(values.email, values.password);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Welcome back</Title>
        <Text c="dimmed" size="sm">
          Sign in to manage your appointments and videos.
        </Text>
      </Stack>
      <Stack gap="md" component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Email" placeholder="you@clinic.kz" required {...form.getInputProps("email")} />
        <PasswordInput
          label="Password"
          placeholder="Your secure password"
          required
          {...form.getInputProps("password")}
        />
        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}
        <Button type="submit" loading={isLoading} radius="xl">
          Sign in
        </Button>
      </Stack>
      <Text size="sm">
        No account yet? <Anchor component={Link} to="/register">Create one now</Anchor>
      </Text>
    </Stack>
  );
};

export default LoginPage;


