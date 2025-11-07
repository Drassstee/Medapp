import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Video } from "expo-av";
import { api, resolveAssetUrl } from "../services/api";
import type { Video as VideoModel } from "../types";

const VideoLibraryScreen = () => {
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<VideoModel[]>("/videos");
      setVideos(data.map((item) => ({ ...item, fileUrl: resolveAssetUrl(item.fileUrl) })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      {videos.map((video) => (
        <Card key={video.id} style={styles.card}>
          <Video
            source={{ uri: video.fileUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="cover"
          />
          <Card.Content>
            <Text variant="titleMedium">{video.title}</Text>
            <Text variant="bodySmall" style={styles.muted}>
              {video.description}
            </Text>
          </Card.Content>
        </Card>
      ))}
      {!loading && videos.length === 0 && (
        <Text style={styles.muted}>No videos available yet.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    overflow: "hidden",
  },
  video: {
    height: 200,
    width: "100%",
  },
  muted: {
    color: "#6b7280",
    marginTop: 8,
  },
});

export default VideoLibraryScreen;


