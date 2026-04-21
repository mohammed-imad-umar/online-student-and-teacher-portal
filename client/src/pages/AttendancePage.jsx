import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";

const classOptions = [
  "Class-01 Mathematics",
  "Class-02 Physics",
  "Class-03 Chemistry",
  "Class-04 Biology",
  "Class-05 English",
  "Class-06 Computer Science",
  "Class-07 History",
  "Class-08 Geography",
  "Class-09 Urdu",
  "Class-10 Islamiat"
];

export default function AttendancePage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ studentId: "", classId: "", date: "", status: "present", faceRecognitionMeta: "mock-face-id" });
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setStatus(error?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (user?.role !== "student") {
      api
        .get("/users?role=student&loggedIn=true")
        .then((res) => setStudents(Array.isArray(res.data) ? res.data : []))
        .catch(() => setStudents([]));
    }
  }, [user?.role]);

  const submit = async () => {
    setStatus("");
    if (user?.role !== "student" && !form.studentId) return setStatus("Select a student");
    if (!form.classId.trim()) return setStatus("classId is required");
    if (!form.date) return setStatus("Date is required");
    try {
      await api.post("/attendance", { ...form, classId: form.classId.trim() });
      setStatus("Saved");
      load();
    } catch (error) {
      setStatus(error?.response?.data?.message || "Failed to save attendance");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-slate-600">
          {user?.role === "student" ? "Your attendance records." : "Mark attendance for logged-in students."}
        </p>
      </div>

      {status && <Alert variant={status === "Saved" ? "success" : "warning"}>{status}</Alert>}

      {user?.role !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Mark attendance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
            >
              <option value="">Select class</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="present">present</option>
              <option value="absent">absent</option>
            </select>
            <Button onClick={submit} className="md:col-span-2">
              Save
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">Loading attendance...</div>
      ) : null}

      {!loading && list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
          No attendance records yet.
        </div>
      ) : !loading ? (
        <div className="grid grid-cols-1 gap-3">
          {list.map((a) => (
            <Card key={a._id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{a.studentId?.name || "Student"}</div>
                  <div className="text-xs text-slate-500">{a.studentId?.email || ""}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {new Date(a.date).toDateString()} • {a.status} • {a.classId}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.status === "present" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {a.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
