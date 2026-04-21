import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", questions: [] });
  const [submissionAnswers, setSubmissionAnswers] = useState({});
  const [status, setStatus] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const load = () => api.get("/assignments").then((res) => setList(res.data));
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setStatus("");
    const t = topic.trim();
    if (!t) return setStatus("Topic is required");
    setLoadingAI(true);
    try {
      const { data } = await api.post("/assignments/generate", { topic: t });
      setGenerated(data.questions || []);
      setForm((prev) => ({ ...prev, questions: data.questions || [] }));
    } catch (e) {
      setStatus(e?.response?.data?.message || "AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  const create = async () => {
    setStatus("");
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title) return setStatus("Title is required");
    if (!description) return setStatus("Description is required");
    if (!form.dueDate) return setStatus("Due date is required");
    try {
      await api.post("/assignments", {
        ...form,
        title,
        description,
        questions: (form.questions || []).filter(Boolean)
      });
      toast.success("Assignment saved");
      setForm({ title: "", description: "", dueDate: "", questions: [] });
      setGenerated([]);
      setTopic("");
      load();
    } catch (e) {
      setStatus(e?.response?.data?.message || "Save failed");
    }
  };
  const submit = async (id) => {
    const raw = submissionAnswers[id] || "";
    const answers = raw.split("\n").map((line) => line.trim()).filter(Boolean);
    if (answers.length === 0) return toast.error("Write at least 1 answer");
    try {
      await api.post(`/assignments/${id}/submit`, { answers });
      toast.success("Submission saved in database");
      setSubmissionAnswers((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Submit failed");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="text-sm text-slate-600">Teachers can generate and publish; students can submit answers.</p>
      </div>

      {status && <Alert variant="warning">{status}</Alert>}

      {user.role !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Create assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                className="flex-1"
                placeholder="Topic for AI generation (e.g., Algebra)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button variant="secondary" onClick={generate} disabled={loadingAI || !topic.trim()}>
                {loadingAI ? "Generating…" : "Generate"}
              </Button>
            </div>

            {generated.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                <div className="mb-2 text-xs font-medium text-slate-600">Generated questions</div>
                <ol className="list-decimal space-y-1 pl-5">
                  {generated.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                className="md:col-span-2"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={create}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
          No assignments yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {list.map((a) => (
            <Card key={a._id}>
              <CardHeader>
                <CardTitle>{a.title}</CardTitle>
                <div className="mt-1 text-xs text-slate-500">
                  Teacher: {a.teacherId?.name || "Teacher"} • Due: {a.dueDate ? new Date(a.dueDate).toDateString() : "—"}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-700">{a.description}</p>
                {a.questions?.length > 0 && (
                  <ol className="ml-4 list-decimal space-y-1 text-sm text-slate-800">
                    {a.questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ol>
                )}
                {user.role === "student" && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write one answer per line in order."
                      value={submissionAnswers[a._id] || ""}
                      onChange={(e) => setSubmissionAnswers((prev) => ({ ...prev, [a._id]: e.target.value }))}
                    />
                    <div className="flex justify-end">
                      <Button variant="secondary" onClick={() => submit(a._id)}>
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
