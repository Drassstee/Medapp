import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export interface Disease {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface PatientMedicalInfo {
  id: number;
  patientId: number;
  doctorId: number;
  gender: string;
  ageGroup: string;
  diseases: Disease[];
  updatedAt: string;
  patient?: { id: number; fullName: string };
  doctor?: { id: number; fullName: string };
}

export interface Patient {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  medicalInfo?: PatientMedicalInfo;
}

export const usePatients = (filter: "all" | "my" = "my") =>
  useQuery({
    queryKey: ["patients", filter],
    queryFn: async () => {
      const { data } = await api.get<Patient[]>("/patients", {
        params: { filter },
      });
      return data;
    },
  });

export const useDiseases = () =>
  useQuery({
    queryKey: ["diseases"],
    queryFn: async () => {
      const { data } = await api.get<Disease[]>("/patients/diseases");
      return data;
    },
  });

export const useAssignPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: number) => {
      const { data } = await api.post("/patients/assign", { patientId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

export const useUpdateMedicalInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      gender,
      ageGroup,
      diseaseIds,
    }: {
      patientId: number;
      gender: string;
      ageGroup: string;
      diseaseIds: number[];
    }) => {
      const { data } = await api.post(`/patients/${patientId}/medical-info`, {
        gender,
        ageGroup,
        diseaseIds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

