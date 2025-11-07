import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Text, Title } from "react-native-paper";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { api, resolveAssetUrl } from "../services/api";
import type { Appointment, Video } from "../types";

const DoctorDashboardScreen = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videosRes, appointmentsRes] = await Promise.all([
        api.get<Video[]>("/videos"),
        api.get<Appointment[]>("/appointments"),
      ]);
      setVideos(
        videosRes.data.map((video) => ({
          ...video,
          fileUrl: resolveAssetUrl(video.fileUrl),
        }))
      );
      setAppointments(appointmentsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = useMemo(
    () => appointments.filter((appt) => appt.status === "pending").length,
    [appointments]
  );

  const upcoming = useMemo(
    () => appointments.filter((appt) => appt.status !== "completed" && appt.status !== "cancelled"),
    [appointments]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <Title style={styles.heading}>Hello Dr. {user?.fullName}</Title>
      <Text variant="bodyMedium" style={styles.subheading}>
        You have {pendingCount} appointment requests awaiting confirmation.
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Upcoming appointments</Text>
          {upcoming.length === 0 ? (
            <Text variant="bodySmall" style={styles.muted}>
              No upcoming appointments.
            </Text>
          ) : (
            upcoming.slice(0, 5).map((appt) => (
              <View key={appt.id} style={styles.listItem}>
                <Avatar.Text size={40} label={appt.patient?.fullName?.[0] ?? "?"} />
                <View style={styles.listContent}>
                  <Text variant="bodyMedium">{appt.patient?.fullName}</Text>
                  <Text variant="bodySmall" style={styles.muted}>
                    {dayjs(appt.scheduledAt).format("MMM D, HH:mm")} · {appt.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Published videos</Text>
          {videos.length === 0 ? (
            <Text variant="bodySmall" style={styles.muted}>
              Upload videos from web dashboard to see them here.
            </Text>
          ) : (
            videos.slice(0, 4).map((video) => (
              <View key={video.id} style={styles.listItem}>
                <Avatar.Icon icon="play" size={40} />
                <View style={styles.listContent}>
                  <Text variant="bodyMedium">{video.title}</Text>
                  <Text variant="bodySmall" style={styles.muted}>
                    {dayjs(video.createdAt).format("MMM D")}
                  </Text>
                </View>
              </View>
            ))
          )}
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  listContent: {
    marginLeft: 12,
    flex: 1,
  },
  muted: {
    color: "#6b7280",
  },
});

export default DoctorDashboardScreen;


