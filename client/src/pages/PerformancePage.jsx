import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "History",
  "Geography",
  "Urdu",
  "Islamiat",
  "Economics",
  "Statistics"
];

export default function PerformancePage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", subject: "", marks: 0, weakAreas: [] });
  const [status, setStatus] = useState("");
  const load = () => api.get("/performance").then((res) => setList(res.data));
  useEffect(() => {
    load();
    if (user.role !== "student") {
      api.get("/users?role=student&loggedIn=true").then((res) => setStudents(res.data));
    }
  }, []);

  const create = async () => {
    setStatus("");
    if (user.role !== "student" && !form.studentId) return setStatus("Select a student");
    if (!form.subject.trim()) return setStatus("Subject is required");
    if (!Number.isFinite(form.marks)) return setStatus("Marks must be a number");
    await api.post("/performance", { ...form, subject: form.subject.trim(), weakAreas: [form.subject.trim()] });
    setStatus("Saved");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <p className="text-sm text-slate-600">
          {user.role === "student" ? "Your performance chart." : "Add results for logged-in students."}
        </p>
      </div>

      {status && <Alert variant={status === "Saved" ? "success" : "warning"}>{status}</Alert>}

      {user.role !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Add result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Marks"
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
            />
            <Button onClick={create} className="md:col-span-3">
              Save
            </Button>
          </CardContent>
        </Card>
      )}
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
          No performance records yet.
        </div>
      ) : (
        <Line
          data={{
            labels: list.map((i) => i.subject),
            datasets: [{ label: "Marks", data: list.map((i) => i.marks), borderColor: "#10b981" }]
          }}
        />
      )}
    </div>
  );
}
