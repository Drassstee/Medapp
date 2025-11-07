import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  FileInput,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCloudUpload } from "@tabler/icons-react";
import api from "../../services/api";
import type { Video } from "../../types";

interface UploadVideoFormValues {
  title: string;
  description: string;
  file: File | null;
}

const UploadVideoForm = () => {
  const queryClient = useQueryClient();
  const form = useForm<UploadVideoFormValues>({
    initialValues: { title: "", description: "", file: null },
    validate: {
      title: (value) => (!value ? "Title is required" : null),
      file: (value) => (!value ? "Please select a video file" : null),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: UploadVideoFormValues) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      if (values.file) {
        formData.append("file", values.file);
      }
      const { data } = await api.post<Video>("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Video uploaded",
        message: "Your educational video is now live.",
        color: "teal",
      });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      form.reset();
    },
    onError: () => {
      notifications.show({
        title: "Upload failed",
        message: "Please try again. Ensure the file is a valid video format.",
        color: "red",
      });
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Stack gap="md">
        <Text fw={600}>Share a new video</Text>
        <TextInput label="Title" placeholder="Healthy lifestyle tips" required {...form.getInputProps("title")} />
        <Textarea
          label="Description"
          placeholder="Explain what patients will learn from this video."
          minRows={3}
          {...form.getInputProps("description")}
        />
        <FileInput
          label="Video file"
          placeholder="Upload .mp4 or .mov"
          icon={<IconCloudUpload size={18} />}
          accept="video/*"
          required
          {...form.getInputProps("file")}
        />
        <Group justify="flex-end">
          <Button type="submit" loading={mutation.isPending}>
            Upload
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default UploadVideoForm;


