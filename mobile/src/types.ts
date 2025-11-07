export type Role = "doctor" | "patient" | "admin";

export interface DoctorProfile {
  speciality?: string;
  experienceYears?: number;
  licenseNumber?: string;
  clinicName?: string;
  city?: string;
  bio?: string;
  consultationFee?: number;
  avatarUrl?: string;
}

export interface PatientProfile {
  gender?: string;
  chronicConditions?: string;
  bloodType?: string;
  allergies?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  doctorProfile?: DoctorProfile | null;
  patientProfile?: PatientProfile | null;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  createdAt: string;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  scheduledAt: string;
  durationMin: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  doctor?: Pick<User, "id" | "fullName"> | null;
  patient?: Pick<User, "id" | "fullName"> | null;
}


