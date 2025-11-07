import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput, Title } from "react-native-paper";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { api, resolveAssetUrl } from "../services/api";
import type { Appointment, User, Video } from "../types";

const PatientDashboardScreen = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [videosRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get<Video[]>("/videos"),
        api.get<User[]>("/users/doctors"),
        api.get<Appointment[]>("/appointments"),
      ]);
      setVideos(videosRes.data.map((video) => ({ ...video, fileUrl: resolveAssetUrl(video.fileUrl) })));
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitAppointment = async () => {
    if (!selectedDoctor || !reason) return;
    try {
      await api.post("/appointments", {
        doctorId: Number(selectedDoctor),
        reason,
        durationMin: 30,
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
      setReason("");
      setSelectedDoctor("");
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <Title style={styles.heading}>Welcome, {user?.fullName}</Title>
      <Text variant="bodyMedium" style={styles.subheading}>
        Book appointments and stay informed with trusted videos.
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Request appointment</Text>
          <TextInput
            label="Choose doctor (ID)"
            value={selectedDoctor}
            onChangeText={setSelectedDoctor}
            style={styles.input}
          />
          <TextInput
            label="Reason"
            value={reason}
            onChangeText={setReason}
            style={styles.input}
            multiline
          />
          <Button mode="contained" onPress={submitAppointment} disabled={!selectedDoctor || !reason}>
            Request
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Available doctors</Text>
          {doctors.slice(0, 5).map((doc) => (
            <View key={doc.id} style={styles.listItem}>
              <Text variant="bodyMedium">{doc.fullName}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {doc.doctorProfile?.speciality ?? "General"}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Your appointments</Text>
          {appointments.slice(0, 5).map((appt) => (
            <View key={appt.id} style={styles.listItem}>
              <Text variant="bodyMedium">Doctor #{appt.doctorId}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {dayjs(appt.scheduledAt).format("MMM D")} · {appt.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Featured videos</Text>
          {videos.slice(0, 3).map((video) => (
            <View key={video.id} style={styles.listItem}>
              <Text variant="bodyMedium">{video.title}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {dayjs(video.createdAt).format("MMM D")}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subheading: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
  muted: {
    color: "#6b7280",
  },
});

export default PatientDashboardScreen;


