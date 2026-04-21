import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Textarea from "../components/ui/Textarea";

export default function PlannerPage() {
  const [goals, setGoals] = useState("");
  const [schedule, setSchedule] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/planner").then((res) => {
      if (!res.data) return;
      setGoals((res.data.goals || []).join(", "));
      setSchedule(
        (res.data.schedule || [])
          .map((s) => `${s.title} @ ${new Date(s.date).toLocaleString()}`)
          .join("\n")
      );
    });
  }, []);

  const parseScheduleLine = (line) => {
    const raw = (line || "").trim();
    if (!raw) return null;
    const parts = raw.split("@");
    if (parts.length === 1) return { title: raw, date: new Date(), reminderEnabled: true };

    const title = parts[0].trim();
    const dateText = parts.slice(1).join("@").trim();
    const date = new Date(dateText);
    if (!title) return null;
    return { title, date: isNaN(date.getTime()) ? new Date() : date, reminderEnabled: true };
  };

  const save = async () => {
    setStatus("");
    setSaving(true);
    try {
      const scheduleItems = schedule
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
        .map(parseScheduleLine)
        .filter(Boolean);

      await api.put("/planner", {
        goals: goals
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        schedule: scheduleItems
      });
      setStatus("Saved");
    } catch (e) {
      setStatus(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Planner</h1>
        <p className="text-sm text-slate-600">Write goals and a simple schedule. Format: `Topic @ 2026-04-16 18:30`.</p>
      </div>

      {status && <Alert variant={status === "Saved" ? "success" : "danger"}>{status}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="h-24"
            placeholder="Goals (comma separated)"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            className="h-44"
            placeholder={"Examples:\nMath revision @ 2026-04-16 18:30\nPhysics notes @ tomorrow 7pm"}
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <div className="flex items-center justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
