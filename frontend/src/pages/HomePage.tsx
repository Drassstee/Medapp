import { Container, Stack, Title } from "@mantine/core";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import VideoGrid from "../components/video/VideoGrid";
import { useVideos } from "../hooks/useVideos";

const HomePage = () => {
  const { data: videos = [], isLoading } = useVideos();

  return (
    <Container size="xl" py="md">
      <Stack gap={80}>
        <HeroSection />
        <FeaturesSection />
        <Stack gap="md" id="library">
          <Title order={3}>Watch trusted medical education videos</Title>
          <VideoGrid videos={videos.slice(0, 6)} isLoading={isLoading} emptyLabel="No public videos yet" />
        </Stack>
        <TestimonialsSection />
      </Stack>
    </Container>
  );
};

export default HomePage;
