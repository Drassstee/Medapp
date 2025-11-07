import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

type Role = "patient" | "doctor";

const RegisterScreen = () => {
  const { register, isLoading } = useAuth();
  const [role, setRole] = useState<Role>("patient");
  const [form, setForm] = useState<Record<string, string>>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    speciality: "",
    licenseNumber: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      };
      if (role === "doctor") {
        payload.doctorProfile = {
          speciality: form.speciality,
          licenseNumber: form.licenseNumber,
          bio: form.bio,
        };
      }
      await register(payload);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Check your details.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create MedApp account
      </Text>
      <SegmentedButtons
        value={role}
        onValueChange={(value) => setRole(value as Role)}
        buttons={[
          { value: "patient", label: "Patient" },
          { value: "doctor", label: "Doctor" },
        ]}
        style={styles.segment}
      />
      <View>
        <TextInput label="Full name" value={form.fullName} onChangeText={(v) => handleChange("fullName", v)} style={styles.input} />
        <TextInput label="Email" value={form.email} onChangeText={(v) => handleChange("email", v)} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput label="Phone" value={form.phone} onChangeText={(v) => handleChange("phone", v)} style={styles.input} />
        <TextInput label="Password" value={form.password} onChangeText={(v) => handleChange("password", v)} secureTextEntry style={styles.input} />
        {role === "doctor" && (
          <>
            <TextInput label="Speciality" value={form.speciality} onChangeText={(v) => handleChange("speciality", v)} style={styles.input} />
            <TextInput label="License number" value={form.licenseNumber} onChangeText={(v) => handleChange("licenseNumber", v)} style={styles.input} />
            <TextInput
              label="Short bio"
              value={form.bio}
              onChangeText={(v) => handleChange("bio", v)}
              style={styles.input}
              multiline
            />
          </>
        )}
        {error && <HelperText type="error">{error}</HelperText>}
        <Button mode="contained" onPress={handleSubmit} loading={isLoading} style={styles.button}>
          Register
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    marginBottom: 16,
    fontWeight: "600",
  },
  segment: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
});

export default RegisterScreen;


