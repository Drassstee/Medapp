import { Stack, Text, Title } from "@mantine/core";
import VideoGrid from "../components/video/VideoGrid";
import { useVideos } from "../hooks/useVideos";

const VideoLibrary = () => {
  const { data: videos = [], isLoading } = useVideos();

  return (
    <Stack gap="md">
      <Title order={2}>MedApp Video Library</Title>
      <Text c="dimmed" maw={640}>
        Explore evidence-based video lectures, wellness programs, and tutorials produced by MedApp
        clinicians.
      </Text>
      <VideoGrid videos={videos} isLoading={isLoading} emptyLabel="No videos published yet." />
    </Stack>
  );
};

export default VideoLibrary;


