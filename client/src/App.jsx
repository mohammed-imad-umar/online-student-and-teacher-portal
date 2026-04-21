import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AIChatPage from "./pages/AIChatPage";
import AttendancePage from "./pages/AttendancePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import PerformancePage from "./pages/PerformancePage";
import ForumPage from "./pages/ForumPage";
import PlannerPage from "./pages/PlannerPage";
import TestsPage from "./pages/TestsPage";
import LiveClassesPage from "./pages/LiveClassesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage type="login" />} />
      <Route path="/signup" element={<AuthPage type="signup" />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="live-classes" element={<LiveClassesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
