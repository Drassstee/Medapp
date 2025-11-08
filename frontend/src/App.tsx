import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VideoLibrary from "./pages/VideoLibrary";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AssignPatientPage from "./pages/AssignPatientPage";
import PatientInfoPage from "./pages/PatientInfoPage";
import PatientDatabasePage from "./pages/PatientDatabasePage";
import { useAuth } from "./hooks/useAuth";

const DashboardEntry = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"} replace />;
};

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="videos" element={<VideoLibrary />} />
    </Route>

    <Route element={<AuthLayout />}>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
    </Route>

    <Route path="dashboard" element={<ProtectedRoute roles={["doctor", "patient"]} />}
    >
      <Route index element={<DashboardEntry />} />
    </Route>

    <Route element={<ProtectedRoute roles={["doctor"]} />}>
      <Route path="dashboard/doctor" element={<DashboardLayout />}>
        <Route index element={<DoctorDashboard />} />
      </Route>
      <Route path="dashboard/patients" element={<DashboardLayout />}>
        <Route index element={<PatientDatabasePage />} />
        <Route path="assign" element={<AssignPatientPage />} />
        <Route path="info" element={<PatientInfoPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={["patient"]} />}>
      <Route path="dashboard/patient" element={<DashboardLayout />}>
        <Route index element={<PatientDashboard />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
