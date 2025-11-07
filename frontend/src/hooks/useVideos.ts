import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { Video } from "../types";

const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_URL ?? "http://localhost:8080";

export const useVideos = () =>
  useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data } = await api.get<Video[]>("/videos");
      return data.map((video) => ({
        ...video,
        fileUrl: video.fileUrl.startsWith("http") ? video.fileUrl : `${UPLOAD_BASE_URL}${video.fileUrl}`,
      }));
    },
  });


