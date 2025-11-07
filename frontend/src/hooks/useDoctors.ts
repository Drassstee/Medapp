import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { User } from "../types";

export const useDoctors = () =>
  useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users/doctors");
      return data;
    },
  });


