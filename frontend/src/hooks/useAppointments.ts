import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { Appointment } from "../types";

export const useAppointments = () =>
  useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await api.get<Appointment[]>("/appointments");
      return data;
    },
  });

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const { data } = await api.put<Appointment>(`/appointments/${id}/status`, { status, notes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};


