import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";

export default function LiveClassesPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", classLink: "", recordingUrl: "", notes: [] });
  const [noteDraft, setNoteDraft] = useState("");
  const [status, setStatus] = useState("");

  const load = () => api.get("/live-classes").then((res) => setList(res.data));
  useEffect(() => { load(); }, []);
  const create = async () => {
    setStatus("");
    const title = form.title.trim();
    const classLink = form.classLink.trim();
    if (!title || !classLink) return setStatus("Title and class link are required");
    await api.post("/live-classes", { ...form, title, classLink, notes: form.notes.filter(Boolean) });
    setForm({ title: "", classLink: "", recordingUrl: "", notes: [] });
    setNoteDraft("");
    setStatus("Created");
    load();
  };

  const update = async (id, patch) => {
    setStatus("");
    await api.patch(`/live-classes/${id}`, patch);
    setStatus("Updated");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-sm text-slate-600">Create class links, add recordings and notes.</p>
      </div>

      {status && <Alert variant={status === "Created" || status === "Updated" ? "success" : "warning"}>{status}</Alert>}

      {user.role !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Create class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Class title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Meet/Zoom link"
              value={form.classLink}
              onChange={(e) => setForm({ ...form, classLink: e.target.value })}
            />
            <Input
              placeholder="Recording URL (optional)"
              value={form.recordingUrl}
              onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
            />
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                className="flex-1"
                placeholder="Add a note (optional)"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const n = noteDraft.trim();
                  if (!n) return;
                  setForm((prev) => ({ ...prev, notes: [...prev.notes, n] }));
                  setNoteDraft("");
                }}
              >
                Add note
              </Button>
            </div>
            {form.notes.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="mb-1 text-xs font-medium text-slate-600">Notes to include</div>
                <ul className="list-disc space-y-1 pl-5">
                  {form.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={create}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
          No live classes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((c) => (
            <Card key={c._id}>
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <div className="mt-1 text-xs text-slate-500">
                  Teacher: {c.teacherId?.name || "Teacher"} • {new Date(c.createdAt).toLocaleString()}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <a className="text-sm font-medium text-indigo-700 hover:underline" href={c.classLink} target="_blank" rel="noreferrer">
                  Join class
                </a>

                {c.recordingUrl ? (
                  <a className="block text-sm text-slate-700 hover:underline" href={c.recordingUrl} target="_blank" rel="noreferrer">
                    Recording
                  </a>
                ) : user.role !== "student" ? (
                  <div className="text-xs text-slate-500">No recording yet</div>
                ) : null}

                {Array.isArray(c.notes) && c.notes.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="mb-1 text-xs font-medium text-slate-600">Notes</div>
                    <ul className="list-disc space-y-1 pl-5">
                      {c.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {user.role !== "student" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Update recording URL"
                      defaultValue={c.recordingUrl || ""}
                      onBlur={(e) => update(c._id, { recordingUrl: e.target.value.trim() })}
                    />
                    <Textarea
                      rows={3}
                      defaultValue={(c.notes || []).join("\n")}
                      placeholder="Update notes (one per line)"
                      onBlur={(e) =>
                        update(c._id, {
                          notes: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean)
                        })
                      }
                    />
                    <div className="text-xs text-slate-500">Tip: fields save on blur.</div>
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
