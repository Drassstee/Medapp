import { AspectRatio, Badge, Card, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import type { Video } from "../../types";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  emptyLabel?: string;
}

const VideoGrid = ({ videos, isLoading, emptyLabel = "No videos yet" }: VideoGridProps) => {
  if (isLoading) {
    return (
      <Grid gutter="xl">
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid.Col span={{ base: 12, md: 4 }} key={index}>
            <Skeleton height={240} radius="lg" />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (!videos.length) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed">{emptyLabel}</Text>
      </Stack>
    );
  }

  return (
    <Grid gutter="xl">
      {videos.map((video) => (
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={video.id}>
          <Card radius="xl" shadow="lg" padding="md" withBorder>
            <Stack gap="sm">
              <AspectRatio ratio={16 / 9} radius="md">
                <video src={video.fileUrl} controls preload="metadata" style={{ width: "100%" }} />
              </AspectRatio>
              <Stack gap={4}>
                <Text fw={600}>{video.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {video.description || "Educational video uploaded by MedApp doctors."}
                </Text>
              </Stack>
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Badge variant="light" color="blue">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </Badge>
                  {video.uploader && (
                    <Text size="sm" c="dimmed">
                      {video.uploader.fullName}
                    </Text>
                  )}
                </Group>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default VideoGrid;


