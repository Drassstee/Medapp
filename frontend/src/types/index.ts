export type Role = "doctor" | "patient" | "admin";

export interface DoctorProfile {
  speciality?: string;
  experienceYears?: number;
  licenseNumber?: string;
  clinicName?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  consultationFee?: number;
}

export interface PatientProfile {
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
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
  thumbnail?: string;
  public: boolean;
  createdAt: string;
  uploader?: {
    id: number;
    fullName: string;
    role: Role;
  } | null;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  scheduledAt: string;
  durationMin: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Pick<User, "id" | "fullName" | "role"> | null;
  patient?: Pick<User, "id" | "fullName"> | null;
}

export interface SymptomsPrediction {
  prediction: string;
  confidence: number;
}


