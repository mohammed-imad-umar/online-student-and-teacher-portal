import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import UiCard, { CardContent as UiCardContent } from "../components/ui/Card";
import Loader from "../components/Loader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const endpoint = user?.role === "student" ? "/dashboard/student" : "/dashboard/teacher";
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((e) => setError(e?.response?.data?.message || "Failed to load dashboard"));
  }, [user]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <Loader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-600">Quick overview of activity and performance.</p>
      </div>
      {user.role === "student" ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card label="Attendance %" value={data.attendancePercentage} />
            <Card label="Predicted Score" value={data.predictedScore} />
            <Card label="Weak Subjects" value={data.weakSubjects.join(", ") || "None"} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Card label="Total Assignments" value={data.totalAssignments} />
            <Card label="Total Tests" value={data.totalTests} />
            <Card label="Forum Discussions" value={data.totalForumPosts} />
            <Card label="Planner Items" value={data.scheduleItems} />
          </div>
          <Bar
            data={{
              labels: data.performance.map((p) => p.subject),
              datasets: [{ label: "Marks", data: data.performance.map((p) => p.marks), backgroundColor: "#4f46e5" }]
            }}
          />
          <UiCard>
            <UiCardContent className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Student success tips</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Daily 30-minute revision gives strong retention.</li>
                <li>Attempt one test every week and review weak topics.</li>
                <li>Use forum to ask doubts and keep planner updated.</li>
              </ul>
            </UiCardContent>
          </UiCard>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Card label="Students" value={data.studentsCount} />
          <Card label="Assignments" value={data.assignmentsCount} />
          <Card label="Attendance Records" value={data.attendanceCount} />
          <Card label="Class Average" value={data.classAverage} />
        </div>
      )}
    </div>
  );
}

function Card({ label, value }) {
  return (
    <UiCard className="p-0">
      <UiCardContent className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </UiCardContent>
    </UiCard>
  );
}
